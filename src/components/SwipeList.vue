<template>
	<div
		class="swipeout-list"
		:class="{'swipeout--disabled': disabled}"
	>
		<swipe-out
			v-for="(item, index) in items"
			:key="item[itemKey || transitionKey] || index"
			:ref="`items`"
			:disabled="disabled"
			:threshold="threshold"
			class="swipeout-list-item"
			@active="$emit('active', $event)"
		>
			<template v-if="$scopedSlots.left" v-slot:left="{ close }">
				<slot name="left" :item="item" :close="close" />
			</template>
			<template v-slot="{ close, revealRight, revealLeft }">
				<div @click="$emit('swipeout:click', item)">
					<slot
						:item="item"
						:index="index"
						:close="close"
						:revealRight="revealRight"
						:revealLeft="revealLeft"
					/>
				</div>
			</template>
			<template v-if="$scopedSlots.right" v-slot:right="{ close }">
				<slot name="right" :item="item" :close="close" />
			</template>
		</swipe-out>
		<template v-if="!items.length">
			<slot name="empty">
				No results !
			</slot>
		</template>
	</div>
</template>
<script>
    /* eslint-disable */
	import SwipeOut from './SwipeOut';

	export default {
		name: 'vue-swipe-list',
		props: {
			items: {
				type: Array,
				required: true,
			},
			itemKey: {
				type: String,
			},
			/**
			 * @deprecated since version 2.0 - use itemKey instead
			 */
			transitionKey: {
				type: String,
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
			revealRight(index) {
				if (!this.$refs.items[index])
					return;
				this.$refs.items[index].revealRight();
			},
			revealLeft(index) {
				if (!this.$refs.items[index])
					return;
				this.$refs.items[index].revealLeft();
			},
			closeActions(index) {
				if (!this.$refs.items)
					return;

				if (index === undefined)
					return this.$refs.items.forEach(i => i.closeActions());

				 if (!this.$refs.items[index])
					 return;

				return this.$refs.items[index].closeActions();
			},
		},
		components: {
			SwipeOut,
		},
	};
</script>
