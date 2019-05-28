import { SwipeList, SwipeOut } from './components';

export {
	SwipeList,
	SwipeOut,
};

export default {
	install(Vue) {
		Vue.component('SwipeList', SwipeList);
		Vue.component('SwipeOut', SwipeOut);
	},
	SwipeList,
	SwipeOut,
};
