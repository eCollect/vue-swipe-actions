
import Vue from 'vue';

import { SwipeList, SwipeOut } from './components';


Vue.use({
	install(V) {
		V.component('SwipeList', SwipeList);
		V.component('SwipeOut', SwipeOut);
	},
});

export default {
	SwipeList,
	SwipeOut,
};
