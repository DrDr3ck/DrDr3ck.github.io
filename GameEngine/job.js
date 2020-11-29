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
    constructor(workTime) {
        this.workTime = workTime; // in ms
        this.currentTime = 0;
        this.available = false; // TODO true;
    }

    prepare() {
        // to do
    }

    update(elapsedTime) {
        this.currentTime += elapsedTime;
        if( this.currentTime >= this.workTime ) {
            this.execute();
        }
    }

    drawProgress(x,y,w,h) {
        // draw a progress bar on the tile
        push();
        noStroke();
        fill(255);
        rect(x, y, Math.round(this.currentTime*w/this.workTime),h);
        stroke(0);
        strokeWeight(1);
        noFill();
        rect(x, y, w, h);
        pop();
    }

    execute() {
        this.executeJob();
        // remove job from JobManager
        jobManager.jobs = jobManager.jobs.filter(j => j !== this);
        delete this;
    }
}