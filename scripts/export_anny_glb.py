#!/usr/bin/env python3
"""
Export Anny parametric human meshes to GLB for the Stitch3D web showcase.

Requires:
  python3.11+ (3.11–3.12 recommended; 3.14 may lack warp wheels)
  pip install -r scripts/requirements-anny-export.txt

The anny[warp] extra installs NVIDIA Warp, which Anny imports at startup.

Based on the official Anny interactive demo export path:
https://github.com/naver/anny/blob/main/src/anny/examples/interactive_demo.py

License: Anny code is Apache 2.0; MakeHuman assets are CC0.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

import anny
import roma
import torch
import trimesh

sys.path.insert(0, str(Path(__file__).resolve().parent))
from anny_body_presets import get_presets, list_presets_table

# Match Gradio demo — rotate Z-up (Anny) to Y-up (Three.js / glTF).
VIEW_TRANSFORM = roma.Rigid(
    roma.euler_to_rotmat("x", [-90.0], degrees=True),
    torch.zeros(3),
).to_homogeneous().numpy()


def export_glb(output_path: Path, phenotype_overrides: dict[str, float]) -> None:
    dtype = torch.float32
    model = anny.create_fullbody_model(
        rig="default",
        topology="default",
        local_changes="default",
        extrapolate_phenotypes=False,
        bone_orientation="blender-rootidentity",
    ).to(dtype=dtype)

    phenotype_kwargs = {key: 0.5 for key in model.phenotype_labels}
    for key, value in phenotype_overrides.items():
        if key in phenotype_kwargs:
            phenotype_kwargs[key] = value

    local_changes_kwargs = {key: 0.0 for key in model.local_change_labels}
    bones_rotvec = torch.zeros((len(model.bone_labels), 3), dtype=dtype)

    bones_rotmat = roma.rotvec_to_rotmat(torch.deg2rad(bones_rotvec))
    translations = torch.zeros((len(bones_rotmat), 3), dtype=dtype)
    pose_parameters = roma.Rigid(bones_rotmat, translations)[None].to_homogeneous()

    output = model(
        pose_parameters=pose_parameters,
        phenotype_kwargs=phenotype_kwargs,
        local_changes_kwargs=local_changes_kwargs,
    )

    vertices = output["vertices"].squeeze(0).cpu().numpy()
    faces = model.faces.cpu().numpy()

    mesh = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    mesh.visual = trimesh.visual.TextureVisuals(
        material=trimesh.visual.material.PBRMaterial(
            baseColorFactor=[0.82, 0.84, 0.88, 0.45],
            metallicFactor=0.15,
            roughnessFactor=0.55,
            doubleSided=True,
            alphaMode="BLEND",
        )
    )

    scene = trimesh.Scene()
    scene.add_geometry(mesh, node_name="AnnyBody")
    scene.apply_transform(VIEW_TRANSFORM)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    scene.export(str(output_path))
    print(f"Exported {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Export Anny bodies as GLB assets.")
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "public" / "models" / "anny",
    )
    parser.add_argument(
        "--group",
        choices=["showcase", "extended", "all"],
        default="showcase",
        help="Preset group: showcase (3), extended (24), or all (27)",
    )
    parser.add_argument("--list", action="store_true", help="Print preset table and exit")
    args = parser.parse_args()

    if args.list:
        print(list_presets_table())
        return

    presets = get_presets(args.group)
    for name, preset in presets.items():
        export_glb(args.out_dir / f"{name}.glb", preset)


if __name__ == "__main__":
    main()
