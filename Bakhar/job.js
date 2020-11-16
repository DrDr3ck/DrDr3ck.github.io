class JobManager {
    constructor() {
        this.jobs = [];
    }

    addJob(job) {
        this.jobs.push(job);
    }

    draw() {
        for( const job of this.jobs ) {
            job.draw();
        }
    }

    update(elapsedTime) {
        for( const job of this.jobs ) {
            if( !job.available ) {
                job.update(elapsedTime);
            }
        }
    }

    getNextJob() {
        if( this.jobs.length === 0 ) {
            return null;
        }
        for( const job of this.jobs ) {
            if( job.available ) {
                job.available = false;
                return job;
            }
        }
    }
}

class JobBase {
    constructor(i,j,workTime) {
        this.i = i;
        this.j = j;
        this.workTime = workTime; // in ms
        this.currentTime = 0;
        this.available = true;
    }

    prepare() {
        // move to tile
    }

    update(elapsedTime) {
        this.currentTime += elapsedTime;
        if( this.currentTime >= this.workTime ) {
            this.execute();
        }
    }

    drawProgress(tileX,tileY) {
        // draw a progress bar on the tile
        push();
        noStroke();
        fill(255);
        rect(tileX, tileY, Math.round(this.currentTime*33/this.workTime),5);
        stroke(0);
        strokeWeight(1);
        noFill();
        rect(tileX, tileY, 33, 5);
        pop();
    }

    execute() {
        this.executeJob();
        // remove job from JobManager
        jobManager.jobs = jobManager.jobs.filter(j => j !== this);
        delete this;
    }
}

class InstallBlockJob extends JobBase {
    constructor(blockIndex,i,j,workTime) {
        super(i,j,workTime);
        this.blockIndex = blockIndex;
    }

    draw() {
        // draw a block skeleton
        if( !this.available ) {
            this.drawProgress(tileMap.indexToX(this.i,this.j),tileMap.indexToY(this.i,this.j));
        }
    }

    executeJob() {
        // set block on tile
    }
}

function test() {
    const testJM = new JobManager();
    jobManager = testJM;
    testJM.addJob( new InstallBlockJob(0,0,0,1000) );
    expect( testJM.jobs.length === 1, "error in addJob" );
    const next = testJM.getNextJob();
    expect( next !== null, "error in getNextJob" );
    expect( testJM.jobs[0].available === false, "job should not be available" );
    next.update(500);
    expect( testJM.jobs.length === 1, "should still work on this job" );
    next.update(500);
    expect( testJM.jobs.length === 0, "job should be removed" );
}

test();