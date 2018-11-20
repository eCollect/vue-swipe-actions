<template>
	<div class="swipeout-list"
		:class="{'swipeout--disabled': disabled}">
		<swipe-out
			v-for="(item, index) in items"
			:key="item[transitionKey] || index"
			:ref="`list-item-${index}`"
			:disabled="disabled"
			:threshold="threshold"
			class="swipeout-list-item"
			@active="$emit('active', $event)"
			@swipeout:click="_emitClick($event, item, index)"
			@swipeout:dobuleclick="_emitDblClick($event, item)"
			@swipeout:contentclick="_contentClick($event, item)"
		>
			<template slot="left" slot-scope="{ close }">
				<slot name="left" :item="item" :close="close"></slot>
			</template>
			<template slot-scope="{ close, revealRight, revealLeft }">
				<slot :item="item" :index="index" :close="close" :revealRight="revealRight" :revealLeft="revealLeft"></slot>
			</template>
			<template slot="right" slot-scope="{ close }">
				<slot name="right" :item="item" :close="close"></slot>
			</template>
		</swipe-out>
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
			threshold: {
				type: Number,
				default: 45,
			},
			disabled: {
				type: Boolean,
				default: false,
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