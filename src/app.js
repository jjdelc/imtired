const MS = 100;
const WorkoutPlayer = class {
    constructor(routine, callback, rest, finish){
        this.routine = routine;
        this.callback = callback;
        this.finish = finish;
        this.rest =  rest;
        this.stopped = false;
    }
    play(){
        const nextStep = (pos) => {
            const step = this.routine.steps[pos];
            this.callback(step);
            if (this.stopped) {
                console.log("Player stopped");
                return
            }
            if (pos + 1 < this.routine.steps.length) {
                setTimeout(() => {
                    this.rest();
                    setTimeout(() => {
                        nextStep(pos + 1);
                    }, this.routine.rest * MS);
                }, step.time * MS);
            } else {
                this.finish()
            }
        };
        nextStep(0);
    }
    stop(){
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
        }
    },
    methods: {
        goHome(){
            this.$emit('go-home');
        },
        restStep(){
            this.state = 'rest';
        },
        showStep(step) {
            this.state = 'step';
            this.currentStep = step;
        },
        finishWorkout(){
            this.state = 'done';
            console.log('Workout finished!');
        },
        begin(){
            console.log("Beginning workout");
            const player = new WorkoutPlayer(this.routine,
                                             this.showStep,
                                             this.restStep,
                                             this.finishWorkout);
            this.player = player;
            player.play();
        },
        stop(){
            this.$emit('go-home');
            this.player.stop();
        }
    }
};


const WORKOUTS = [{
    id: 'standard',
    name: 'Standard 7m workout',
    graphic: '',
    rest: 5,
    steps: [{
        name: 'Jumping jacks',
        graphic: '',
        time: 30
    }, {
        name: 'Wall sit',
        graphic: '',
        time: 30
    }, {
        name: 'Push ups',
        graphic: '',
        time: 30
    }, {
        name: 'Ab crunch',
        graphic: '',
        time: 30
    }, {
        name: 'Chair step',
        graphic: '',
        time: 30
    }, {
        name: 'Squat',
        graphic: '',
        time: 30
    }, {
        name: 'Triceps on chair',
        graphic: '',
        time: 30
    }, {
        name: 'Plank',
        graphic: '',
        time: 30
    }, {
        name: 'High knees',
        graphic: '',
        time: 30
    }, {
        name: 'Lunge (Left)',
        graphic: '',
        time: 15
    }, {
        name: 'Lunge (Right)',
        graphic: '',
        time: 15
    }, {
        name: 'Push up w/rotation',
        graphic: '',
        time: 30
    }, {
        name: 'Side plank (Left)',
        graphic: '',
        time: 15
    }, {
        name: 'Side plank (Right)',
        graphic: '',
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
            console.log('going home!')
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
