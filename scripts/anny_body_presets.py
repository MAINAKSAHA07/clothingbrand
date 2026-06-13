"""
Anny body phenotype presets for Stitch3D GLB export.

Phenotype sliders (all 0.0 – 1.0 unless noted):
  gender      0 = male-presenting, 1 = female-presenting
  age         lower ≈ older / senior, higher ≈ younger (young adult ~0.67)
  weight      0 = lean, 1 = heavy
  muscle      0 = low muscle, 1 = athletic
  height      0 = short, 1 = tall
  proportions 0 = short-limbed, 1 = long-limbed (optional)

Source: https://naver.github.io/anny/build/shape_parameterization.html
"""

from __future__ import annotations

from typing import TypedDict


class PhenotypePreset(TypedDict, total=False):
    gender: float
    age: float
    weight: float
    muscle: float
    height: float
    proportions: float


class FigurePreset(TypedDict):
    label: str
    category: str
    phenotypes: PhenotypePreset


# ── Original showcase bodies (used in See It Worn today) ─────────────────────
SHOWCASE_PRESETS: dict[str, FigurePreset] = {
    "adult-neutral": {
        "label": "Adult Neutral",
        "category": "adult",
        "phenotypes": {
            "age": 0.55,
            "gender": 0.5,
            "weight": 0.5,
            "muscle": 0.5,
            "height": 0.5,
        },
    },
    "athletic-male": {
        "label": "Athletic Male",
        "category": "adult",
        "phenotypes": {
            "age": 0.45,
            "gender": 0.0,
            "weight": 0.42,
            "muscle": 0.78,
            "height": 0.62,
        },
    },
    "young-female": {
        "label": "Young Female",
        "category": "adult",
        "phenotypes": {
            "age": 0.72,
            "gender": 1.0,
            "weight": 0.46,
            "muscle": 0.38,
            "height": 0.48,
        },
    },
}

# ── Extended library: men, women, kids, seniors, height/weight variants ───────
EXTENDED_PRESETS: dict[str, FigurePreset] = {
    # Men
    "man-average": {
        "label": "Man — Average",
        "category": "men",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.58,
            "weight": 0.52,
            "muscle": 0.48,
            "height": 0.52,
        },
    },
    "man-tall-lean": {
        "label": "Man — Tall & Lean",
        "category": "men",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.62,
            "weight": 0.28,
            "muscle": 0.45,
            "height": 0.82,
            "proportions": 0.72,
        },
    },
    "man-short-stocky": {
        "label": "Man — Short & Stocky",
        "category": "men",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.55,
            "weight": 0.72,
            "muscle": 0.55,
            "height": 0.22,
            "proportions": 0.35,
        },
    },
    "man-heavy": {
        "label": "Man — Heavy / Plus",
        "category": "men",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.50,
            "weight": 0.85,
            "muscle": 0.35,
            "height": 0.48,
        },
    },
    "man-muscular": {
        "label": "Man — Muscular",
        "category": "men",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.48,
            "weight": 0.58,
            "muscle": 0.88,
            "height": 0.60,
        },
    },
    "man-senior-60plus": {
        "label": "Man — Senior 60+",
        "category": "senior",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.22,
            "weight": 0.55,
            "muscle": 0.32,
            "height": 0.46,
        },
    },
    "man-senior-70plus": {
        "label": "Man — Elder 70+",
        "category": "senior",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.12,
            "weight": 0.50,
            "muscle": 0.25,
            "height": 0.42,
        },
    },
    # Women
    "woman-average": {
        "label": "Woman — Average",
        "category": "women",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.60,
            "weight": 0.50,
            "muscle": 0.35,
            "height": 0.48,
        },
    },
    "woman-tall-lean": {
        "label": "Woman — Tall & Lean",
        "category": "women",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.65,
            "weight": 0.30,
            "muscle": 0.32,
            "height": 0.78,
            "proportions": 0.70,
        },
    },
    "woman-petite": {
        "label": "Woman — Petite",
        "category": "women",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.68,
            "weight": 0.42,
            "muscle": 0.30,
            "height": 0.18,
            "proportions": 0.40,
        },
    },
    "woman-curvy": {
        "label": "Woman — Curvy / Plus",
        "category": "women",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.58,
            "weight": 0.78,
            "muscle": 0.28,
            "height": 0.46,
        },
    },
    "woman-athletic": {
        "label": "Woman — Athletic",
        "category": "women",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.64,
            "weight": 0.40,
            "muscle": 0.72,
            "height": 0.55,
        },
    },
    "woman-senior-60plus": {
        "label": "Woman — Senior 60+",
        "category": "senior",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.24,
            "weight": 0.52,
            "muscle": 0.28,
            "height": 0.44,
        },
    },
    "woman-senior-70plus": {
        "label": "Woman — Elder 70+",
        "category": "senior",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.14,
            "weight": 0.48,
            "muscle": 0.22,
            "height": 0.40,
        },
    },
    # Kids & teens
    "child-boy-8": {
        "label": "Boy — Child (~8 y/o)",
        "category": "kids",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.90,
            "weight": 0.38,
            "muscle": 0.30,
            "height": 0.28,
        },
    },
    "child-girl-8": {
        "label": "Girl — Child (~8 y/o)",
        "category": "kids",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.90,
            "weight": 0.36,
            "muscle": 0.28,
            "height": 0.26,
        },
    },
    "child-boy-12": {
        "label": "Boy — Pre-teen (~12 y/o)",
        "category": "kids",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.84,
            "weight": 0.40,
            "muscle": 0.32,
            "height": 0.38,
        },
    },
    "child-girl-12": {
        "label": "Girl — Pre-teen (~12 y/o)",
        "category": "kids",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.84,
            "weight": 0.38,
            "muscle": 0.30,
            "height": 0.36,
        },
    },
    "teen-boy": {
        "label": "Teen Boy (~16 y/o)",
        "category": "kids",
        "phenotypes": {
            "gender": 0.0,
            "age": 0.76,
            "weight": 0.42,
            "muscle": 0.40,
            "height": 0.58,
        },
    },
    "teen-girl": {
        "label": "Teen Girl (~16 y/o)",
        "category": "kids",
        "phenotypes": {
            "gender": 1.0,
            "age": 0.78,
            "weight": 0.40,
            "muscle": 0.32,
            "height": 0.52,
        },
    },
    # Height × weight matrix (unisex-leaning adult)
    "adult-short-light": {
        "label": "Adult — Short, Light",
        "category": "matrix",
        "phenotypes": {
            "gender": 0.5,
            "age": 0.58,
            "weight": 0.25,
            "muscle": 0.40,
            "height": 0.20,
        },
    },
    "adult-short-heavy": {
        "label": "Adult — Short, Heavy",
        "category": "matrix",
        "phenotypes": {
            "gender": 0.5,
            "age": 0.55,
            "weight": 0.80,
            "muscle": 0.45,
            "height": 0.22,
        },
    },
    "adult-tall-light": {
        "label": "Adult — Tall, Light",
        "category": "matrix",
        "phenotypes": {
            "gender": 0.5,
            "age": 0.58,
            "weight": 0.28,
            "muscle": 0.42,
            "height": 0.85,
        },
    },
    "adult-tall-heavy": {
        "label": "Adult — Tall, Heavy",
        "category": "matrix",
        "phenotypes": {
            "gender": 0.5,
            "age": 0.52,
            "weight": 0.82,
            "muscle": 0.50,
            "height": 0.82,
        },
    },
    "adult-average-light": {
        "label": "Adult — Average, Light",
        "category": "matrix",
        "phenotypes": {
            "gender": 0.5,
            "age": 0.58,
            "weight": 0.28,
            "muscle": 0.38,
            "height": 0.50,
        },
    },
    "adult-average-heavy": {
        "label": "Adult — Average, Heavy",
        "category": "matrix",
        "phenotypes": {
            "gender": 0.5,
            "age": 0.55,
            "weight": 0.78,
            "muscle": 0.42,
            "height": 0.50,
        },
    },
}

ALL_PRESETS: dict[str, FigurePreset] = {**SHOWCASE_PRESETS, **EXTENDED_PRESETS}


def get_presets(group: str = "all") -> dict[str, PhenotypePreset]:
    """Return flat phenotype dicts keyed by filename slug."""
    if group == "showcase":
        source = SHOWCASE_PRESETS
    elif group == "extended":
        source = EXTENDED_PRESETS
    else:
        source = ALL_PRESETS

    return {slug: preset["phenotypes"] for slug, preset in source.items()}


def list_presets_table() -> str:
    lines = ["| File | Label | Category | age | gender | weight | muscle | height |"]
    lines.append("|------|-------|----------|-----|--------|--------|--------|--------|")
    for slug, preset in ALL_PRESETS.items():
        p = preset["phenotypes"]
        lines.append(
            f"| `{slug}.glb` | {preset['label']} | {preset['category']} | "
            f"{p.get('age', '-')} | {p.get('gender', '-')} | {p.get('weight', '-')} | "
            f"{p.get('muscle', '-')} | {p.get('height', '-')} |"
        )
    return "\n".join(lines)
