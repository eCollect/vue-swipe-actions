<template>
	<div class="swipeout-list card">
		<transition-group :name="transitionString">
			<swipe-out
                v-for="(item, index) in items"
                :key="item[transitionKey] || index"
                :ref="`list-item-${index}`"
                class="swipeout-list-item"
                @swipeout:click="_emitClick($event, item, index)"
                @swipeout:dobuleclick="_emitDblClick($event, item)"
                @swipeout:contentclick="_contentClick($event, item)"
			>
				<template slot="left">
					<slot name="left" :item="item"></slot>
				</template>
				<template slot-scope="{ close, revealRight, revealLeft }">
					<slot :item="item" :index="index" :close="close" :revealRight="revealRight" :revealLeft="revealLeft"></slot>
				</template>
				<template slot="right">
					<slot name="right" :item="item"></slot>
				</template>
			</swipe-out>
		</transition-group>
		<template v-if="!items.length">
			<slot name="empty">No results !</slot>
		</template>
	</div>
</template>
<script>
    /* eslint-disable */
	import SwipeOut from './SwipeOut.vue';

	export default {
		name: 'vue-swipe-list',
		props: {
			items: {
				type: Array,
				required: true,
			},
			transitionKey: {
				type: String,
				default: 'id',
			},
			transitionString: {
				type: String,
				default: 'swipe-list-item',
			},
		},
		methods: {
			_emitClick(event, item) {
				this.$emit('swipeout:click', { event, item });
			},
			_emitDblClick(event, item) {
				this.$emit('swipeout:doubleclick', { event, item });
			},
			_contentClick(event, item) {
                this.$emit('swipeout:contentclick', { event, item });
			},
		},
		components: {
			SwipeOut,
		},
	};
</script>