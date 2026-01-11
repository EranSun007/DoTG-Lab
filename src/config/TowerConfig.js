export const TowerConfig = {
    "Big": {
        "name": "Elf Wood",
        "description": "Standard ranged tower with high precision",
        "cost": 40,
        "range": 100,
        "attackSpeed": 1,
        "damage": 31,
        "projectileSpeed": 200,
        "projectileSize": 5,
        "color": "#FF4444",
        "sprite": "TOWER_RANGED",
        "projectileType": "ARROW",
        "states": [
            {
                "name": "Marksman (30°)",
                "angle": 30,
                "range": 220,
                "attackSpeed": 2,
                "damage": 20
            },
            {
                "name": "Full Circle",
                "angle": 360,
                "range": 100,
                "attackSpeed": 1,
                "damage": 10
            },
            {
                "name": "Two Teams",
                "angle": 90,
                "range": 100,
                "attackSpeed": 1.5,
                "damage": 15
            }
        ]
    },
    "Small": {
        "name": "Mage Tower",
        "description": "Deals massive damage in a concentrated cone",
        "cost": 20,
        "range": 80,
        "attackSpeed": 0.8,
        "damage": 15,
        "splashRadius": 30,
        "splashDamage": 8,
        "projectileSpeed": 150,
        "projectileSize": 8,
        "color": "#44FF44",
        "sprite": "TOWER_AOE",
        "projectileType": "FIREBALL",
        "states": [
            {
                "name": "Standard (360°)",
                "angle": 360,
                "range": 80,
                "attackSpeed": 0.8,
                "damage": 15
            },
            {
                "name": "Concentrated (45°)",
                "angle": 45,
                "range": 160,
                "attackSpeed": 1.2,
                "damage": 45
            }
        ]
    }
};
