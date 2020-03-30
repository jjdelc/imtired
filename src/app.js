const MS = 1000;
const BG_SOUND_FILE = './media/beep.mp3';
const MOTIVATORS = {
    "10seconds": "./media/10secondsleft.mp3",
    "20seconds": "./media/20secondsleft.mp3",
    "321stop": "./media/321stop.mp3",
    "321go": "./media/321go.mp3",
    "alldone": "./media/alldone.mp3",
    "okgetready": "./media/okgetready.mp3",
    "rest10seconds": "./media/rest10seconds.mp3",
    "go": "./media/go.mp3",
};

function playMotivator(name) {
    new Audio(MOTIVATORS[name]||name).play();
}


function delay(t, v) {
   return new Promise(function(resolve) {
       setTimeout(resolve.bind(null, v), t * MS);
   });
}

const Counter = class {
    constructor(callback, isWorkout, customMedia){
        this.callback = callback;
        this.isWorkout = isWorkout;
        this.customMedia = customMedia;
    }
    async playMotivators(timeLeft){
        if (this.isWorkout === null) {
            if (timeLeft === 6 && this.customMedia) playMotivator(this.customMedia);
            return
        }
        if (this.isWorkout) {
            if (timeLeft === 21) playMotivator("20seconds");
            if (timeLeft === 11) playMotivator("10seconds");
            if (timeLeft === 4) playMotivator("321stop");
        } else {
            if (timeLeft === 10) playMotivator("rest10seconds");
            if (timeLeft === 8 && this.customMedia) playMotivator(this.customMedia);
            if (timeLeft === 4) playMotivator("321go");
        }
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
                this.finish();
                await delay(MS/2);  // Wait before saying the last words
                playMotivator("alldone");
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
            this.countDown(this.routine.rest, false, nextStep.media);
        },
        countDown(time, isWorkout, media) {
            this.timerClass = 'progress-timer';
            this.timeLeft = time;
            const counter = new Counter(timeLeft => {
                this.timeLeft = timeLeft;
            }, isWorkout, media);
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
            playMotivator("okgetready");
            console.log("Beginning workout");
            this.countDown(this.routine.rest, null, this.routine.steps[0].media);
            await delay(this.routine.rest);
            playMotivator("go");
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
        media: 'media/jumping-jacks.mp3',
        time: 30
    }, {
        name: 'Wall sit',
        graphic: 'media/wall-sit.svg',
        media: 'media/wall-sit.mp3',
        time: 30
    }, {
        name: 'Push ups',
        graphic: 'media/push-ups.svg',
        media: 'media/push-up.mp3',
        time: 30
    }, {
        name: 'Ab crunch',
        graphic: 'media/ab-crunch.svg',
        media: 'media/ab-crunch.mp3',
        time: 30
    }, {
        name: 'Chair step',
        graphic: 'media/chair-step.svg',
        media: 'media/stair-step.mp3',
        time: 30
    }, {
        name: 'Squat',
        graphic: 'media/squat.svg',
        media: 'media/squats.mp3',
        time: 30
    }, {
        name: 'Triceps on chair',
        graphic: 'media/triceps.svg',
        media: 'media/triceps.mp3',
        time: 30
    }, {
        name: 'Plank',
        graphic: 'media/plank.svg',
        media: 'media/plank.mp3',
        time: 30
    }, {
        name: 'High knees',
        graphic: 'media/high-knees.svg',
        media: 'media/high-knees.mp3',
        time: 30
    }, {
        name: 'Lunge (Left)',
        graphic: 'media/lunge-left.svg',
        media: 'media/lunge-left.mp3',
        time: 15
    }, {
        name: 'Lunge (Right)',
        graphic: 'media/lunge-right.svg',
        media: 'media/lunge-right.mp3',
        time: 15
    }, {
        name: 'Push up w/rotation',
        graphic: 'media/push-up-rotate.svg',
        media: 'media/pushup-w-rotation.mp3',
        time: 30
    }, {
        name: 'Side plank (Left)',
        graphic: 'media/side-plank-left.svg',
        media: 'media/side-plank-left.mp3',
        time: 15
    }, {
        name: 'Side plank (Right)',
        graphic: 'media/side-plank-right.svg',
        media: 'media/side-plank-right.mp3',
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
