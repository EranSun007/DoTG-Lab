export const TowerConfig = {
    "Big": {
        "name": "Big Tower",
        "description": "Basic tower with balanced stats",
        "cost": 40,
        "range": 100,
        "attackSpeed": 1,
        "damage": 31,
        "projectileSpeed": 200,
        "projectileSize": 5,
        "color": "#FF0000",
        "sprite": "tower_ranged.png",
        "projectileType": "ARROW"
    },
    "Small": {
        "name": "Small Tower",
        "description": "Deals splash damage to multiple enemies",
        "cost": 20,
        "range": 80,
        "attackSpeed": 0.8,
        "damage": 15,
        "splashRadius": 30,
        "splashDamage": 8,
        "projectileSpeed": 150,
        "projectileSize": 8,
        "color": "#00FF00",
        "sprite": "tower_aoe.png",
        "projectileType": "FIREBALL"
    }
};
