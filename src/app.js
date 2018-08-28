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
            message: "HOLAS"
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
            currentStep: 0
        }
    },
    methods: {
        begin(){
            alert(this.routine.name);
        }
    }
};

const WORKOUTS = [{
    id: 'basic',
    name: 'Basic',
    rest: 15,
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
