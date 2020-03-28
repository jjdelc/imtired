const MS = 1000;
const BG_SOUND_FILE = './media/beep.mp3';
const MOTIVATORS = {
    "10seconds": "./media/10secondsleft.mp3",
    "321stop": "./media/321stop.mp3"
};


function delay(t, v) {
   return new Promise(function(resolve) {
       setTimeout(resolve.bind(null, v), t * MS);
   });
}

const Counter = class {
    constructor(callback, isWorkout){
        this.callback = callback;
        this.isWorkout = isWorkout
    }
    async playMotivators(timeLeft){
        if (this.isWorkout) {
            if (timeLeft === 11) new Audio(MOTIVATORS["10seconds"]).play();
        }
        if (timeLeft === 4) new Audio(MOTIVATORS["321stop"]).play();
    }
    async countDown(timeLeft){
        this.callback(timeLeft);
        await delay(1);
        this.playMotivators(timeLeft);
        if (timeLeft > 1) {
            this.countDown(timeLeft - 1);
        }
    }
};

const BgSound = class {
    constructor(){
        const audio = new Audio(BG_SOUND_FILE);
        audio.loop = true;
        audio.addEventListener('ended', {

        });
        this.audio = audio;
    }
    start() {
        this.audio.play();
    }
    stop(){
        this.audio.pause();
    }
};

const WorkoutPlayer = class {
    constructor(routine, callback, rest, finish){
        this.routine = routine;
        this.callback = callback;
        this.finish = finish;
        this.rest =  rest;
        this.stopped = false;
    }
    play(){
        const nextStep = async (pos) => {
            if (this.stopped) return;
            const step = this.routine.steps[pos];
            this.callback(step);
            await delay(step.time);
            if (pos + 1 < this.routine.steps.length) {
                const next = this.routine.steps[pos + 1];
                this.rest(next);
                await delay(this.routine.rest);
                nextStep(pos + 1);
            } else {
                this.finish()
            }
        };
        nextStep(0);
    }
    stop(){
        console.log("Player stopped");
        this.stopped = true;
    }
};

const TopMenu = {
    template: '#topMenuTpl'
};

const AppStart = {
    template: '#appStartTpl',
    props: [
        'workouts'
    ],
    data() {
        return {
        }
    },
    methods: {
        startWorkout(wo){
            this.$emit('start-workout', wo);
        }
    }
};
const WorkoutMain = {
    template: '#workoutTpl',
    props: [
        'routine'
    ],
    data(){
        return {
            currentStep: null,
            state: 'rest',
            timeLeft: 0,
            timerClass: '',
            currentN: 0,
            totalN: 0
        }
    },
    methods: {
        goHome(){
            this.$emit('go-home');
        },
        restStep(nextStep){
            this.state = 'rest';
            this.currentStep = nextStep;
            this.countDown(this.routine.rest);
        },
        countDown(time, isWorkout) {
            this.timerClass = 'progress-timer';
            this.timeLeft = time;
            const counter = new Counter(timeLeft => {
                this.timeLeft = timeLeft;
            }, isWorkout);
            counter.countDown(time);
        },
        showStep(step) {
            this.state = 'step';
            this.currentN++;
            this.currentStep = step;
            this.countDown(step.time, true);
        },
        finishWorkout(){
            this.state = 'done';
            this.awake.disable();
            this.bgSound.stop();
            console.log('Workout finished!');
        },
        async begin(){
            this.state = 'warmup';
            this.awake = new NoSleep();
            this.awake.enable();
            this.totalN = this.routine.steps.length;
            const player = new WorkoutPlayer(
                this.routine,
                this.showStep,
                this.restStep,
                this.finishWorkout
            );
            this.player = player;
            this.bgSound = new BgSound();
            this.bgSound.start();
            console.log("Beginning workout");
            this.countDown(this.routine.rest, false);
            await delay(this.routine.rest);
            player.play();
        },
        stop(){
            this.$emit('go-home');
            this.player.stop();
            this.awake.disable();
            this.bgSound.stop();
        }
    }
};


const WORKOUTS = [{
    id: 'standard',
    name: 'Standard 7m workout',
    graphic: '',
    rest: 10,
    steps: [{
        name: 'Jumping jacks',
        graphic: 'media/jumping-jacks.svg',
        time: 30
    }, {
        name: 'Wall sit',
        graphic: 'media/wall-sit.svg',
        time: 30
    }, {
        name: 'Push ups',
        graphic: 'media/push-ups.svg',
        time: 30
    }, {
        name: 'Ab crunch',
        graphic: 'media/ab-crunch.svg',
        time: 30
    }, {
        name: 'Chair step',
        graphic: 'media/chair-step.svg',
        time: 30
    }, {
        name: 'Squat',
        graphic: 'media/squat.svg',
        time: 30
    }, {
        name: 'Triceps on chair',
        graphic: 'media/triceps.svg',
        time: 30
    }, {
        name: 'Plank',
        graphic: 'media/plank.svg',
        time: 30
    }, {
        name: 'High knees',
        graphic: 'media/high-knees.svg',
        time: 30
    }, {
        name: 'Lunge (Left)',
        graphic: 'media/lunge-left.svg',
        time: 15
    }, {
        name: 'Lunge (Right)',
        graphic: 'media/lunge-right.svg',
        time: 15
    }, {
        name: 'Push up w/rotation',
        graphic: 'media/push-up-rotate.svg',
        time: 30
    }, {
        name: 'Side plank (Left)',
        graphic: 'media/side-plank-left.svg',
        time: 15
    }, {
        name: 'Side plank (Right)',
        graphic: 'media/side-plank-right.svg',
        time: 15
    }, ]
}];


const app = new Vue({
    el: '#app',
    data: {
        state: 'start',
        routine: null,
        workouts: WORKOUTS
    },
    methods: {
        goHome(){
            console.log('going home!');
            this.state = 'start';
        },
        startWorkout(wo){
            this.state = 'workout';
            this.routine = wo;
            Vue.nextTick().then(
                () => this.$refs.workoutScreens.begin()
            )
        }
    },
    components: {
        TopMenu,
        AppStart,
        WorkoutMain
    }
});
