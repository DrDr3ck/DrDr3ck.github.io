class ToolManager {
    constructor() {
        this.currentTool = null;
    }

    setTool(tool) {
        if( this.currentTool ) {
            this.currentTool.cancel();
        }
        this.currentTool = tool;
        if( this.currentTool ) {
            this.currentTool.start();
        }
    }
}

class ToolBase {
    constructor(name) {
        this.name = name;
    }

    start() {

    }

    action() {

    }

    cancel() {

    }

    draw() {
        push();
        fill(51);
        const tileX = Math.floor((mouseX-20)/tileSize);
        const tileY = Math.floor((mouseY-20)/tileSize);
        if( tileX >= 0 && tileY >= 0 && tileX < tileMap.ni && tileY < tileMap.nj ) {
            rect(tileX*tileSize+20, tileY*tileSize+20, tileSize, tileSize);
        }
        pop();
    }
}

function test() {
    const testTM = new ToolManager();
    expect( testTM.currentTool === null, "error in ToolManager constructor" );
    testTM.setTool( new ToolBase("myTool") );
    expect( testTM.currentTool !== null, "error in setTool");
    expect( testTM.currentTool.name === "myTool", "error in ToolBase constructor");
    testTM.setTool( null );
    expect( testTM.currentTool === null, "error in setTool");
}

test();