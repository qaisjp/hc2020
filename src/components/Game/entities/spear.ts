import Phaser from "phaser"

class Spear extends Phaser.GameObjects.Sprite {
    id: string;
    _angle: number;
    _velocity: any;
    _initSpeed: number;
    _initAccel: number;
    _maxSpeed: number;
    _accel: any;
    _enemyHit: boolean;
    _wallHit: boolean;
    constructor(scene, x, y, id = 'local', key, frame, angle = 0) {
        super(scene, x, y, key, frame);

        this.id = id;
        this._angle = angle;
        this._initSpeed = 170;
        this._initAccel = -1;
        this._maxSpeed = 200;
        this._enemyHit = false;
        this._wallHit = false;
    }

    setup(scene: Phaser.Scene) {
        scene.physics.world.enable(this);
        scene.add.existing(this);
        if (this.body) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            var speed = this._initSpeed;
            var accel = this._initAccel;
            body.setVelocity(speed * Math.cos(this._angle), speed * Math.sin(this._angle))
            body.setAcceleration(accel * Math.cos(this._angle), accel * Math.sin(this._angle))
            this._velocity = body.velocity;
            this._accel = body.acceleration;
            body.setMaxSpeed(this._maxSpeed);
            // body.drag.set(1, 0);
            body.setSize(body.width - 2, body.height);
        }
    }

    update() {
        if (this.body) {
            const body = this.body as Phaser.Physics.Arcade.Body;
            if (this._enemyHit) {
                var speed = body.maxSpeed;
                body.setVelocityX(speed * Math.cos(this._angle));
                body.setVelocityY(speed * Math.sin(this._angle));
            } else if (this._wallHit) {
                body.setVelocityX(0);
                body.setVelocityY(0);
                body.setImmovable();
            } else {
                body.setVelocity(this._velocity + this._accel);
                this._velocity = body.velocity;
            }
        }
    }

    _addAnimations(anims, frameRate = 60, loop = false) {
        // for (var i = 0, l = anims.length; i < l; ++i) {
        //     let anim = anims[i];
        //     // this.animations.add(anim.name, anim.frames, frameRate, loop);
        // }
    }
}

export default Spear;