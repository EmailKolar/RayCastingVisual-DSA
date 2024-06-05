"use strict";

window.addEventListener("load",start);
function start(){
    tick();
}


//GRID - VORES virtuelle verden er bestemt ud fra
const GRID_SIZE = 16; // grid er 16*16
const GRID_SCALE = 10; // 1 celle på grid gange med 10
const GRID_RANGE = GRID_SCALE * GRID_SIZE;
let GRID = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
]


//init canvas
const canvas = document.getElementById('screen');
const context = canvas.getContext('2d');


//screen dims
const WIDTH = 300;
const HALF_WIDTH = 150;
const HEIGHT = 200;
const HALF_HEIGHT = 100;


//PLAYER
let playerPosX = 20;
let playerPosY = 20;
let playerAngle = Math.PI / 3; // hvilken vej vi peger i radianer
let playerMoveX = 0;
let playerMoveY = 0;
let playerMoveAngle = 0;
let speed = 0.5;

//FOV
const FOV = Math.PI / 3;
const ANGLE_STEP = FOV / WIDTH;

//move player listeners
document.onkeydown = function(event){
    switch(event.key){
        case 'ArrowDown': playerMoveX = -1; playerMoveY = -1;break;
        case 'ArrowUp': playerMoveX = +1; playerMoveY = +1; break;
        case 'ArrowLeft': playerMoveAngle = 1; break;
        case 'ArrowRight': playerMoveAngle = -1; break;
    }
}
document.onkeyup = function(event){
    switch(event.key){
        case 'ArrowDown': 
        case 'ArrowUp': playerMoveX = 0; playerMoveY = 0; break;
        case 'ArrowLeft': 
        case 'ArrowRight': playerMoveAngle = 0; break;
    }
}


function tick(){
    canvas.width = window.innerWidth * 0.3;
    canvas.height = window.innerHeight* 0.3;
    context.fillStyle = "#00008B";
    context.fillRect(canvas.width / 2 - HALF_WIDTH, canvas.height / 2 - HALF_HEIGHT, WIDTH, HEIGHT );
    let centerScreen = Math.floor(canvas.width / 2)-150
    



    //MOVING THE PLAYER
    let playerOffsetX = Math.sin(playerAngle) * speed;
    let playerOffsetY = Math.cos(playerAngle) * speed;

    let gridTargetX = Math.floor(playerPosY / GRID_SCALE) * GRID_SIZE + Math.floor((playerPosX + playerOffsetX * playerMoveX) / GRID_SCALE);
    let gridTargetY = Math.floor((playerPosY + playerOffsetY * playerMoveY) / GRID_SCALE) * GRID_SIZE + Math.floor(playerPosX / GRID_SCALE);

    if(playerMoveX && GRID[gridTargetX]==0) {
        playerPosX += playerOffsetX * playerMoveX;
    }
    if(playerMoveY && GRID[gridTargetY]==0) {
        playerPosY += playerOffsetY * playerMoveY;
    }
    if(playerMoveAngle){
        playerAngle += 0.03 * playerMoveAngle; 
    }

    //RAYCASTING
    let curAngle = playerAngle + (FOV/2);
    let rayStartX = Math.floor(playerPosX / GRID_SCALE) * GRID_SCALE; //Vi sætter ray start til topleft af den celle player er i
    let rayStartY = Math.floor(playerPosY / GRID_SCALE) * GRID_SCALE;

    for(let ray = 0; ray < WIDTH; ray++){//300 rays fordi det er vores resoluton
        let curSin = Math.sin(curAngle); 
        curSin = curSin ? curSin : 0.000001;//if currentSin = 0, set to 0.0..1 For at undgå 0division
        let curCos = Math.cos(curAngle); 
        curCos = curCos ? curCos : 0.000001;//if currentCos = 0, set to 0.0..1 For at undgå 0division
        //vertical line intersection
        let rayEndX, rayEndY, rayDirectionX, verticalDepth;
        if(curSin > 0){ // peger højre
            rayEndX = rayStartX + GRID_SCALE; //Vi tilføjer Scale for at sætte os i højre hjørne
            rayDirectionX = 1; //positiv x retning
        }else{ // peger venstre
            rayEndX = rayStartX;
            rayDirectionX = -1; //negativ x-retning
        }
        for(let offset = 0; offset < GRID_RANGE; offset += GRID_SCALE){ // vi looper maksimale antal gange af hvor stor griddet er, men vi vil altid nå et break
            verticalDepth = (rayEndX - playerPosX) / curSin; 
            rayEndY = playerPosY + verticalDepth * curCos;
            let gridTargetX = Math.floor(rayEndX / GRID_SCALE);
            let gridTargetY = Math.floor(rayEndY / GRID_SCALE);
            if(curSin <= 0){ // for ikke at komme udenfor griddet hvis vi peger til venstre
                    gridTargetX += rayDirectionX;
            }
            let targetSquare = gridTargetY * GRID_SIZE + gridTargetX; // vi finder arr index
            if(targetSquare < 0 || targetSquare > GRID.length -1){ //out of bounds
                break;
            }
            if(GRID[targetSquare]!=0){ //væg
                break;
            }
            rayEndX += rayDirectionX * GRID_SCALE; //vi incrementer med en celle bredde
        }

        //hori line intersection
        let rayDirectionY;
        let horizonatalDepth;
        if(curCos > 0){
            rayEndY = rayStartY + GRID_SCALE;
            rayDirectionY = 1;
        }else{
            rayEndY = rayStartY;
            rayDirectionY = -1;
        }
        for(let offset = 0; offset < GRID_RANGE; offset += GRID_SCALE){
            horizonatalDepth = (rayEndY - playerPosY) / curCos;
            rayEndX = playerPosX + horizonatalDepth * curSin;
            let gridTargetX = Math.floor(rayEndX / GRID_SCALE);
            let gridTargetY = Math.floor(rayEndY / GRID_SCALE);
            if(curCos <= 0){ // for ikke at komme udenfor griddet
                    gridTargetY += rayDirectionY;
            }
            let targetSquare = gridTargetY * GRID_SIZE + gridTargetX;
            if(targetSquare < 0 || targetSquare > GRID.length -1){ //out of bounds
                break;
            }
            if(GRID[targetSquare]!=0){
                break;
            }
            rayEndY += rayDirectionY * GRID_SCALE;
        }


        //render 3d projection
        let depth = verticalDepth < horizonatalDepth ? verticalDepth : horizonatalDepth; //shortest depth
        depth *= Math.cos(playerAngle - curAngle);//magisk linje der fjerner fisheye effekt
        let wallHeight = Math.min(GRID_SCALE * 300 / (depth + 0.0001), HEIGHT);
        context.fillStyle = verticalDepth < horizonatalDepth ? 'darkgrey' : '#F0F8FF';
        context.fillRect(centerScreen + ray, 11 + ( HEIGHT / 2 - wallHeight / 2), 1, wallHeight);

        curAngle -= ANGLE_STEP;
        
    }



    setTimeout(tick, 1000/60);

}