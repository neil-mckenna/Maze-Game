const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cellsHoriz = 10;
const cellsVert = 6;


const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHoriz;
const unitLengthY = height / cellsVert;


const engine = Engine.create();
engine.world.gravity.y = 0.01;
engine.world.gravity.x = 0;


const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height,
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);

const wallThickness = 12;


// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, wallThickness, { isStatic: true, render: { fillStyle:  'red'}  }),
    Bodies.rectangle(width / 2, height, width, wallThickness, { isStatic: true, render: { fillStyle:  'red'}  }),
    Bodies.rectangle(0, height / 2, wallThickness, height, { isStatic: true, render: { fillStyle:  'red'}  }),
    Bodies.rectangle(width, height / 2, wallThickness, height, { isStatic: true, render: { fillStyle:  'red'}  })

];

World.add(world, walls);


// Maze generation

// helper shuffle function
const shuffle = (arr) => {
    let counter = arr.length;

    while(counter > 0)
    {
        const idx = Math.floor(Math.random() * counter);
        counter--;

        const temp = arr[counter];
        arr[counter] = arr[idx];
        arr[idx] = temp;
    }

    return arr;
};



const grid = Array(cellsVert).fill(null).map(() => Array(cellsHoriz).fill(false));
const verticals = Array(cellsVert).fill(null).map(() => Array(cellsHoriz - 1).fill(false))
const horizontals = Array(cellsVert - 1).fill(null).map(() => Array(cellsHoriz).fill(false))


const startRow = Math.floor(Math.random() * cellsVert);
const startColumn = Math.floor(Math.random() * cellsHoriz);

const stepThroughCell = (row, column) => {
    // if I had visited the cell row column return early
    if(grid[row][column] === true){
        return;
    }

    // mark cell has been visited
    grid[row][column] = true;

    // assemble a randomly order list of neightbours
    const neigbours = shuffle([
        [row - 1, column, 'up'],
        [row + 1, column, 'down'],
        [row, column + 1, 'right'],
        [row, column - 1, 'left'],
    ]);



    for(let neigbour of neigbours)
    {
        const [nextRow, nextColumn, direction] = neigbour;

        // see of that neighbours is out of bounds
        if(nextRow < 0 || nextRow >= cellsVert || nextColumn < 0 || nextColumn >= cellsHoriz)
        {
            // skip out of this iteration
            continue;
        }

        // if we have visted that neigbours continue to next neighbours
        if(grid[nextRow][nextColumn])
        {
            // if grid value has a true skip to next iteration
            continue;
        }

        // remove a wall form horix or vertical array
        if(direction === 'left')
        {
            verticals[row][column - 1] = true;
        }
        else if (direction === 'right'){
            verticals[row][column] = true;
        }
        else if(direction === 'up')
        {
            horizontals[row - 1][column] = true;
        }
        else if(direction === 'down')
        {
            horizontals[row][column] = true;
        }
        else {
            console.log("BUG Maybe");
        }

        // recurse call the function
        // console.log("steped through");
        stepThroughCell(nextRow, nextColumn);

    }

};

stepThroughCell(startRow, startColumn);


// console.log(grid);
// console.log(verticals);
//  console.log(horizontals);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open)
        {
            return;
        }
        else
        {
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX / 2,
                rowIndex * unitLengthY + unitLengthY,
                unitLengthX,
                5,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle:  'red',
                    }

                }
            );

            World.add(world, wall);
        }
    });
});

verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if(open)
        {
            return;
        }
        else
        {
            const wall = Bodies.rectangle(
                columnIndex * unitLengthX + unitLengthX,
                rowIndex * unitLengthY + unitLengthY  / 2,
                5,
                unitLengthY,
                {
                    label: 'wall',
                    isStatic: true,
                    render: {
                        fillStyle:  'red',
                    }
                }
            );

            World.add(world, wall);
        }
    });
});

// goal
const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.7,
    unitLengthY * 0.7,
    {
        label: 'goal',
        isStatic: true,
        render: {
            fillStyle:  'cornsilk',
        }

    }
);

World.add(world, goal);

// ball
const ballRadius = Math.min(unitLengthX, unitLengthY);
const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius * 0.2,
    {
        label: 'ball',
        render: {
            fillStyle:  'aqua',
        }
    }

);

World.add(world, ball);

document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    const ballSpeed = 5;
    const capSpeed = 12;

    console.log(x.toFixed(1), y.toFixed(1));

    if(event.keyCode == 87)
    {
        // up
        if(Math.abs(y) <= capSpeed)
        {
            Body.setVelocity(ball, { x, y: y - ballSpeed });
        }
    }

    if(event.keyCode == 83)
    {
        // down

        if(Math.abs(y) <= capSpeed)
        {
            Body.setVelocity(ball, { x, y: y + ballSpeed });
        }

    }

    if(event.keyCode == 68)
    {
        // right
        if(Math.abs(x) <= capSpeed)
        {
            Body.setVelocity(ball, { x: x + ballSpeed, y });
        }

    }

    if(event.keyCode == 65)
    {
        // left
        if(Math.abs(x) <= capSpeed)
        {
            Body.setVelocity(ball, { x: x - ballSpeed, y });
        }

    }
});

// Win condition

Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];

        if(
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        )
        {
            // show winner
            document.querySelector('.winner').classList.remove('hidden');

            world.gravity.y = 1;

            world.bodies.forEach(body => {
                if(body.label == 'wall' || body.label == 'goal')
                {
                    Body.setStatic(body, false);

                }
            });

        }
    });
});


document.querySelector('#retry').onclick = () => {
    document.querySelector('.winner').classList.add('hidden');
    window.location.reload(true);

};
