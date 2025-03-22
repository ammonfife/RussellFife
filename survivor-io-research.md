# Survivor.io Game Mechanics Research

## Overview
Survivor.io is a top-down zombie survival game with the following key characteristics:
- Players survive against waves of enemies (zombies)
- Top-down perspective with minimalistic 2D graphics
- Skills and evolution system
- Time-based survival mechanics

## Core Mechanics

### Character Movement
- Top-down movement using virtual joystick
- Character automatically attacks nearby enemies

### Skills System
- Skills are active buffs and abilities that drop in-game
- Players can obtain skills by:
  - Leveling up (selecting 1 of 3 skills)
  - Opening monster chests after defeating bosses

### Evolution System
- Skills can be evolved by combining an active skill with its matching passive skill
- Evolution creates more powerful abilities
- Examples of evolutions:
  - Magnetic Rebounder (Boomerang + Hi-Power Magnet)
  - Pressure Forcefield (Forcefield + Energy Drink)
  - Death Ray (Laser Launcher + Energy Cube)

### Enemy Waves
- Enemies continuously spawn in waves
- Difficulty increases over time
- Boss encounters at specific intervals

### Protective Mechanics
- Some skills create protective circles/fields
- Players can use these to manage crowds of enemies

### Resource Collection
- Experience crystals for leveling up
- Gold from chests
- Lucky crates that can automatically evolve weapons

## Visual Style
- Minimalistic 2D graphics
- Toony character designs with simple shapes
- Clear visual effects for different abilities
- Top-down perspective

## Game Loop
1. Move around the map avoiding enemies
2. Automatically attack nearby enemies
3. Collect experience to level up
4. Choose new skills/upgrades
5. Evolve skills when possible
6. Survive as long as possible
7. Defeat bosses to progress

## Key Features to Implement
- Top-down movement with automatic attacks
- Skill selection and evolution system
- Wave-based enemy spawning
- Visual effects for different abilities
- Protective mechanics (forcefield, etc.)
- Experience/leveling system
