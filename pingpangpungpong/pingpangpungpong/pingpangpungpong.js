import { FIELD } from "./constants.js";
import { Vec3 } from "./math.js";
import { Renderer } from "./renderer.js";


// Gustay
class Gustav {

    static size = { normal: 2, bby: 1};
    
    static MAX_SPEED = 30;
    static START_SPEED = 8;
    static FAC_SPEED = 1.1;


    constructor() {
        this.bby_count = 0;
        this.bounce_count = 0;
        this.speed = 6;

        this.reset();

        this.model = new Float32Array([
            Gustav.size.normal,  0,  0,  0,
            0,  Gustav.size.normal,  0,  0,
            0,  0,  1,  0,
            0,  0,  0,  1
        ]);
    }

    update_matrix() {

        const p = this.position;

        this.model[12] = p.x;
        this.model[13] = p.y;
    }

    update(dt) {
        const diff = Vec3.from(this.direction);
        diff.mult_scalar(this.speed * dt); // delta time
        this.position.add_vector(diff);

        const real_gustav_size = Gustav.size.normal * .5;
        let bounce = false;

        if(this.position.x >= FIELD.width - real_gustav_size) {
            this.position.x = FIELD.width - real_gustav_size;
            
            bounce = true;
        }
        else if(this.position.x <= real_gustav_size - FIELD.width) {
            this.position.x = real_gustav_size - FIELD.width;
            bounce = true;
        }

        if(bounce) {
            this.speed_up();
            this.direction.x *= -1;
        }

        this.update_matrix();
    }

    /**
     * 
     * @param {Player} player 
     */
    check_player_collision(player) {

        let to_gustav = Vec3.from(this.position);
        to_gustav.sub_vector(player.position);

        let diff = Vec3.abs(to_gustav);
        diff.sub_vector(new Vec3(
            (Gustav.size.normal + Player.SIZE.x) * .5,
            (Gustav.size.normal + Player.SIZE.y) * .5,
            0
            ));

        let bounce = false;

        if(diff.y < 0 && diff.x < 0) {
            bounce = true;

            if(diff.y > diff.x) {
                if(to_gustav.dot(new Vec3(0, 1, 0)) > 0) {
                    
                    this.position.y = player.position.y + Player.SIZE.y * .5 + Gustav.size.normal * .5;
                }
                else {
                    this.position.y = player.position.y - Player.SIZE.y * .5 - Gustav.size.normal * .5;
                }
                this.direction.y *= -1;
            }
            else {
                if(to_gustav.dot(new Vec3(1, 0, 0)) > 0) {
                    
                    this.position.x = player.position.x + Player.SIZE.x * .5 + Gustav.size.normal * .5;
                }
                else {
                    this.position.x = player.position.x - Player.SIZE.x * .5 - Gustav.size.normal * .5;
                }
                this.direction.x *= -1;
            }
        }

        if(bounce) {
            this.speed_up();
        }

    }

    speed_up() {
        this.speed *= Gustav.FAC_SPEED;
        this.speed = this.speed >= Gustav.MAX_SPEED ? Gustav.MAX_SPEED : this.speed;
    }

    reset() {
        this.speed = Gustav.START_SPEED;
        this.position = new Vec3(0., 0., 0.);
        this.direction = this.new_direction();
    }

    new_direction() {
        let side = Math.random() > .5 ? 1 : -1;
        let result = Vec3.normalize(new Vec3(Math.random() * 2. - 1., .75, 0));
        result.mult_scalar(side);
        return result;
    }
}


// Player
class Player {

    static SIZE = { x: 5, y: 3 };
    static BASE_Y = FIELD.height - Player.SIZE.y;

    constructor(side) {

        this.position = new Vec3(0, Player.BASE_Y * side, 0);
        // matrices
        this.model = new Float32Array([
            Player.SIZE.x,      0,                  0,  0,
            0,                  Player.SIZE.y,      0,  0,
            0,                  0,                  1,  0,
            this.position.x,    this.position.y,    0,  1
        ]);
    }

    set_position(x) {
        this.position.x = x;
        this.model[12] = this.position.x;
    }
}


// Game
class PingPangPungPong {

    constructor() {

        this.pause = false;

        this.renderer = new Renderer("game");

        this.player_top = new Player(1);
        this.player_bottom = new Player(-1);
        this.player_score = [0, 0];

        this.gustav = new Gustav();

        this.renderer.canvas.addEventListener("pointermove", (event) => {
            
            if(this.pause) {
                return;
            }

            const pos = this.renderer.screen_to_world_position(event.clientX, event.clientY);

            const first_player = pos.y > 0;
            const move_interaction = Math.abs(pos.y) > 12;

            if(move_interaction) {

                const x_min = .5 * Player.SIZE.x - FIELD.width;
                const x_max = FIELD.width - .5 * Player.SIZE.x;

                let x = pos.x < x_min ? x_min : pos.x > x_max ? x_max : pos.x ;

                if(first_player) {
                    this.player_top.set_position(x);
                }
                else {
                    this.player_bottom.set_position(x);
                }
            }
        });

        this.renderer.canvas.addEventListener("pointerdown", (event) => {
            
            const pos = this.renderer.screen_to_world_position(event.clientX, event.clientY);

            let diff = Vec3.abs(new Vec3(pos.x - this.gustav.position.x, pos.y - this.gustav.position.y, 0));

            if(diff.x <= Gustav.size.normal && diff.y <= Gustav.size.normal) {
                this.pause = !this.pause;
                return;
            }

            if(this.pause) {
                return; 
            }
            
            const first_player = pos.y > 0;
            const move_interaction = Math.abs(pos.y) > 12;

            if(!move_interaction) {
                
                this.renderer.radius = 5.;
            }
        });
    }


    init() {

        this.last_time = Date.now();

        this.renderer.init();


        // setup timing
        this.this_time = Date.now();
        this.delta = this.this_time - this.last_time;
        this.last_time = this.this_time;
        console.log(`Initialization took: ${this.delta}ms`);

        this.pause = true;
    }

    

    update() {

        this.this_time = Date.now();
        this.delta = this.this_time - this.last_time;
        this.last_time = this.this_time;

        if(this.pause) {
            return;
        }

        const dt = this.delta / 1000.;

        this.gustav.update(dt);

        let scored = false;
        if(this.gustav.position.y - Gustav.size.normal * .5 <  -FIELD.height) {
            this.player_score[0]++;
            scored = true;
        }
        else if(this.gustav.position.y + Gustav.size.normal * .5 > FIELD.height) {
            this.player_score[1]++;
            scored = true;
        }

        if(scored) {
            this.gustav.reset();
        }


        this.gustav.check_player_collision(this.player_bottom);
        this.gustav.check_player_collision(this.player_top);


        this.renderer.update_angle(dt * 3.);
        this.renderer.update_radius(dt * 6.);

    }

    render() {

        const color = this.pause ? {x: .2, y: .2, z: .2} : {x: .9, y: .9, z: .9};
        const bby_color = this.pause ? {x: .2, y: .2, z: .2} : {x: .5, y: .5, z: .5};

        // update matrices

        this.renderer.clear();


        this.renderer.render_score(1, this.player_score[0]);
        this.renderer.render_score(-1, this.player_score[1]);

        this.renderer.render_line(12, color);
        this.renderer.render_line(-12, color);
        this.renderer.render_line(0, color);

        this.renderer.render_bby(this.gustav.position, bby_color);

        this.renderer.render_rect(this.gustav.model);

        this.renderer.render_rect(this.player_top.model, color);
        this.renderer.render_rect(this.player_bottom.model, color);
    }

    shutdown() {
        this.renderer.cleanup();
    }
}



/**
 * @type {PingPangPungPong}
 */
let game;

function loop() {

    game.update();
    game.render();

    requestAnimationFrame(loop);
}


function start() {


    game = new PingPangPungPong();
    game.init();

    loop();
}


window.onload = start;