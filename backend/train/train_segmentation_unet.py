"""
train_segmentation_unet.py
--------------------------
Trains a PyTorch U-Net Deep Learning model for semantic segmentation
of microscopic earthworm prostate gland tissues.

Output:
Saves trained PyTorch model to: backend/app/ml/models/segmentation_model.pth
Loaded by: app.ml.model_loader.ModelLoader.load_segmentation_model()
"""

import os
import sys
from pathlib import Path
import cv2
import numpy as np

# Ensure backend root is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.core.config import MODELS_DIR, SEGMENTATION_MODEL_PATH, IMAGE_SIZE

try:
    import torch
    import torch.nn as nn
    import torch.optim as optim
    from torch.utils.data import Dataset, DataLoader
    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False


# =====================================================================
# 1. PyTorch U-Net Architecture
# =====================================================================

if TORCH_AVAILABLE:

    class DoubleConv(nn.Module):
        """(Convolution => [BN] => ReLU) * 2"""
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.double_conv = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
            )

        def forward(self, x):
            return self.double_conv(x)


    class UNet(nn.Module):
        """
        Lightweight & robust U-Net for biological tissue segmentation.
        Input: (B, 3, 512, 512) RGB
        Output: (B, 1, 512, 512) Logits
        """
        def __init__(self, in_channels=3, out_channels=1, features=[32, 64, 128, 256]):
            super().__init__()
            self.downs = nn.ModuleList()
            self.ups = nn.ModuleList()
            self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

            # Down part of U-Net
            for feature in features:
                self.downs.append(DoubleConv(in_channels, feature))
                in_channels = feature

            # Bottleneck
            self.bottleneck = DoubleConv(features[-1], features[-1] * 2)

            # Up part of U-Net
            for feature in reversed(features):
                self.ups.append(
                    nn.ConvTranspose2d(feature * 2, feature, kernel_size=2, stride=2)
                )
                self.ups.append(DoubleConv(feature * 2, feature))

            self.final_conv = nn.Conv2d(features[0], out_channels, kernel_size=1)

        def forward(self, x):
            skip_connections = []

            for down in self.downs:
                x = down(x)
                skip_connections.append(x)
                x = self.pool(x)

            x = self.bottleneck(x)
            skip_connections = skip_connections[::-1]

            for idx in range(0, len(self.ups), 2):
                x = self.ups[idx](x)
                skip_connection = skip_connections[idx // 2]
                concat_skip = torch.cat((skip_connection, x), dim=1)
                x = self.ups[idx + 1](concat_skip)

            return self.final_conv(x)


    # =====================================================================
    # 2. Combined Loss: Binary Cross Entropy + Soft Dice Loss
    # =====================================================================

    class DiceBCELoss(nn.Module):
        def __init__(self, smooth=1e-5):
            super().__init__()
            self.smooth = smooth
            self.bce = nn.BCEWithLogitsLoss()

        def forward(self, inputs, targets):
            # BCE Loss
            bce_loss = self.bce(inputs, targets)

            # Dice Loss
            probs = torch.sigmoid(inputs)
            inputs_flat = probs.view(-1)
            targets_flat = targets.view(-1)

            intersection = (inputs_flat * targets_flat).sum()
            dice_loss = 1.0 - (
                (2.0 * intersection + self.smooth)
                / (inputs_flat.sum() + targets_flat.sum() + self.smooth)
            )

            return bce_loss + dice_loss


    # =====================================================================
    # 3. Microscopic Tissue Dataset
    # =====================================================================

    class ProstateMicroscopyDataset(Dataset):
        def __init__(self, image_paths, mask_paths=None, target_size=IMAGE_SIZE):
            self.image_paths = image_paths
            self.mask_paths = mask_paths
            self.target_size = target_size

        def __len__(self):
            return len(self.image_paths)

        def __getitem__(self, idx):
            img_path = str(self.image_paths[idx])
            img = cv2.imread(img_path)
            if img is None:
                raise ValueError(f"Failed to load image: {img_path}")
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, self.target_size, interpolation=cv2.INTER_AREA)

            # Normalize to [0, 1] and transpose to (C, H, W)
            img_tensor = torch.tensor(img, dtype=torch.float32).permute(2, 0, 1) / 255.0

            if self.mask_paths is not None:
                mask_path = str(self.mask_paths[idx])
                mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
                if mask is None:
                    raise ValueError(f"Failed to load mask: {mask_path}")
                mask = cv2.resize(mask, self.target_size, interpolation=cv2.INTER_NEAREST)
                mask = (mask > 127).astype(np.float32)
                mask_tensor = torch.tensor(mask, dtype=torch.float32).unsqueeze(0)
                return img_tensor, mask_tensor

            return img_tensor


def train_unet(
    dataset_dir: str = None,
    epochs: int = 15,
    batch_size: int = 4,
    learning_rate: float = 1e-3,
):
    """
    Main training function for PyTorch U-Net.
    """
    if not TORCH_AVAILABLE:
        print("[ERROR] PyTorch is not installed in this environment.")
        print("To install PyTorch, run: pip install torch torchvision")
        return

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Discover or synthesize dataset
    image_paths = []
    mask_paths = []

    if dataset_dir and os.path.exists(dataset_dir):
        img_dir = Path(dataset_dir) / "images"
        msk_dir = Path(dataset_dir) / "masks"

        for p in img_dir.glob("*.*"):
            if p.suffix.lower() in {".png", ".jpg", ".jpeg", ".tif", ".tiff"}:
                corresponding_mask = msk_dir / f"{p.stem}.png"
                if not corresponding_mask.exists():
                    corresponding_mask = msk_dir / p.name
                if corresponding_mask.exists():
                    image_paths.append(p)
                    mask_paths.append(corresponding_mask)

        print(f"Discovered {len(image_paths)} paired images and masks in {dataset_dir}")

    if len(image_paths) == 0:
        print("No user dataset provided. Generating synthetic demonstration microscopy pairs...")
        demo_dir = Path(__file__).resolve().parent / "sample_dataset"
        demo_imgs = demo_dir / "images"
        demo_masks = demo_dir / "masks"
        demo_imgs.mkdir(parents=True, exist_ok=True)
        demo_masks.mkdir(parents=True, exist_ok=True)

        for i in range(16):
            # Create synthetic organ & background
            synth_img = np.random.randint(20, 50, (512, 512, 3), dtype=np.uint8)
            synth_mask = np.zeros((512, 512), dtype=np.uint8)

            axes = (np.random.randint(100, 150), np.random.randint(60, 90))
            center = (256 + np.random.randint(-20, 20), 256 + np.random.randint(-20, 20))
            angle = np.random.randint(0, 180)

            cv2.ellipse(synth_mask, center, axes, angle, 0, 360, 255, -1)
            cv2.ellipse(synth_img, center, axes, angle, 0, 360, (180, 140, 210), -1)

            p_img = demo_imgs / f"sample_{i:03d}.png"
            p_msk = demo_masks / f"sample_{i:03d}.png"
            cv2.imwrite(str(p_img), synth_img)
            cv2.imwrite(str(p_msk), synth_mask)
            image_paths.append(p_img)
            mask_paths.append(p_msk)

        print(f"Created {len(image_paths)} synthetic training pairs for verification.")

    dataset = ProstateMicroscopyDataset(image_paths, mask_paths)
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    model = UNet(in_channels=3, out_channels=1).to(device)
    criterion = DiceBCELoss()
    optimizer = optim.AdamW(model.parameters(), lr=learning_rate, weight_decay=1e-4)

    print(f"\nStarting U-Net Training for {epochs} epochs...")
    for epoch in range(1, epochs + 1):
        model.train()
        epoch_loss = 0.0

        for images, masks in dataloader:
            images = images.to(device)
            masks = masks.to(device)

            optimizer.zero_grad()
            predictions = model(images)
            loss = criterion(predictions, masks)
            loss.backward()
            optimizer.step()

            epoch_loss += loss.item() * len(images)

        avg_loss = epoch_loss / len(dataset)
        print(f"Epoch [{epoch:02d}/{epochs:02d}] - Loss: {avg_loss:.4f}")

    # Save full model artifact (compatible with torch.load in ModelLoader)
    torch.save(model, SEGMENTATION_MODEL_PATH)
    print(f"\n[OK] U-Net model successfully trained and saved to: {SEGMENTATION_MODEL_PATH}")
    print("BioVision ModelLoader will now automatically use this model for deep learning segmentation!")


if __name__ == "__main__":
    data_arg = sys.argv[1] if len(sys.argv) > 1 else None
    train_unet(data_arg, epochs=10)
