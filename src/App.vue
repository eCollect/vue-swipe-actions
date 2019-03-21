<template>
	<div id="app">
		<swipe-list
			ref="list"
			class="card"
			:disabled="!enabled"
			:items="mockSwipeList[page]"
			item-key="id"
			:revealed.sync="revealed"
			@closed="setLastEvent('closed', $event)"
			@leftRevealed="setLastEvent('leftRevealed', $event)"
			@rightRevealed="setLastEvent('rightRevealed', $event)"
		>
			<template v-slot="{ item, index, revealLeft, revealRight, close }">
				<!-- item is the corresponding object from the array -->
				<!-- index is clearly the index -->
				<!-- revealLeft is method which toggles the left side -->
				<!-- revealRight is method which toggles the right side -->
				<!-- close is method which closes an opened side -->
				<div ref="content" class="card-content" @click.native="itemClick(item)">
					<!-- style content how ever you like -->
					<h2>{{ item.title }}</h2>
					<p><b>id:</b> {{ item.id }} <b>description:</b> {{ item.description }}</p>
					<b>index:</b><span> {{ index }}</span>
				</div>
			</template>
			<!-- left swipe side template and v-slot:left="{ item }" is the item clearly -->
			<!-- remove if you dont wanna have left swipe side  -->
			<template v-slot:left="{ item, close, index }">
				<div class="swipeout-action red" title="remove" @click="remove(item)">
					<!-- place icon here or what ever you want -->
					<i class="fa fa-trash"></i>
				</div>
				<div class="swipeout-action purple" @click="close">
					<!-- place icon here or what ever you want -->
					<i class="fa fa-close"></i>
				</div>
			</template>
			<!-- right swipe side template and v-slot:right"{ item }" is the item clearly -->
			<!-- remove if you dont wanna have right swipe side  -->
			<template v-slot:right="{ item }">
				<div class="swipeout-action blue">
					<!-- place icon here or what ever you want -->
					<i class="fa fa-heart"></i>
				</div>
				<div class="swipeout-action green">
					<!-- place icon here or what ever you want -->
					<i class="fa fa-heart"></i>
				</div>
			</template>
			<template v-slot:empty>
				<div>
					<!-- change mockSwipeList to an empty array to see this slot in action  -->
					list is empty ( filtered or just empty )
				</div>
			</template>
		</swipe-list>
		<div class="toolbar">
			<div class="toolbar-section">
				<p>
					<button @click="revealFirstLeft">
						reveal 1st left
					</button>
					<button @click="revealFirstRight">
						reveal 1st right
					</button>
					<button @click="closeFirst">
						close 1st
					</button>
					<button @click="closeAll">
						close all
					</button>
					<button @click="page = Math.max(page - 1, 0)">
						prev
					</button>
					<button @click="page = Math.min(page + 1, 1)">
						next
					</button>
				</p>
			</div>
			<div class="toolbar-section--center" />
			<div class="toolbar-section">
				<small>revealed: {{ Object.entries(revealed).map(([index, side]) => `${index}: ${side}`).join(', ') }}</small>
			</div>
			<div class="toolbar-section--center" />
			<div class="toolbar-section">
				<small>last event: <template v-if="lastEventDescription">[<b>{{ lastEventDescription.name }}</b>] index: {{ lastEventDescription.index }} id: {{ lastEventDescription.id }}</template><span v-else>none</span></small>
			</div>
		</div>
		<p>
			<small>
				<i>Press and hold [shift] to select text</i>
			</small>
		</p>
	</div>
</template>

<script>
	import { SwipeList, SwipeOut } from './components/index';

	export default {
		name: 'App',
		components: {
			SwipeOut,
			SwipeList,
		},
		data() {
			return {
				enabled: true,
				page: 0,
				revealed: {},
				lastEventDescription: '',
				mockSwipeList: [
					[
						{
							id: 'a',
							title: 'Some title',
							description: 'some description',
						},
						{
							id: 'b',
							title: 'Some title',
							description: 'some description',
						},
						{
							id: 'c',
							title: 'Some title',
							description: 'some description',
						},
					],
					[
						{
							id: 'd',
							title: 'Some title',
							description: 'some description',
						},
						{
							id: 'e',
							title: 'Some title',
							description: 'some description',
						},
						{
							id: 'f',
							title: 'Some title',
							description: 'some description',
						},
					],
				],
			};
		},
		mounted() {
			// ideally should be in some global handler/store
			window.addEventListener('keydown', this.onKeyDown);
			window.addEventListener('keyup', this.onKeyUp);
		},
		beforeDestroy() {
			window.removeEventListener('keydown', this.onKeyDown);
			window.removeEventListener('keyup', this.onKeyUp);
		},
		methods: {
			revealFirstRight() {
				this.$refs.list.revealRight(0);
			},
			revealFirstLeft() {
				this.$refs.list.revealLeft(0);
			},
			closeFirst() {
				this.$refs.list.closeActions(0);
			},
			closeAll() {
				this.$refs.list.closeActions();
			},
			remove(item) {
				this.$set(this.mockSwipeList, this.page, this.mockSwipeList[this.page].filter(i => i !== item));
			},

			setLastEvent(name, { item, index }) {
				this.lastEventDescription = {
					name,
					index,
					id: item.id,
				};
			},

			itemClick(e) {
				console.log(e, 'item click');
			},
			fbClick(e) {
				console.log(e, 'First Button Click');
			},
			sbClick(e) {
				console.log(e, 'Second Button Click');
			},
			// keyboard
			onKeyDown(e) {
				if (e.keyCode !== 16) return;
				this.enabled = false;
			},
			onKeyUp(e) {
				if (e.keyCode !== 16) return;
				this.enabled = true;
			},
		},
	};
</script>
<style>
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

/* app specific styles */

.swipeout-action {
  display: flex;
  align-items: center;
  padding: 0 3rem;
  cursor: pointer;
  left: 0;
}
/* https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/color/ */
.swipeout-action.blue {
    color: white;
    background-color: rgb(0, 122, 255);
}
.swipeout-action.blue:hover {
    background-color: darken(rgb(0, 122, 255), 5%);
}
.swipeout-action.purple {
    color: white;
    background-color: rgb(88, 86, 214);
}
.swipeout-action.purple:hover {
    background-color: darken(rgb(88, 86, 214), 5%);
}

.swipeout-action.red {
    color: white;
    background-color: rgb(255, 59, 48);
}
.swipeout-action.red:hover {
    background-color: darken(rgb(255, 59, 48), 5%);
}
.swipeout-action.green {
    color: white;
    background-color: rgb(76, 217, 100);
}
.swipeout-action.green:hover {
	background-color: darken(rgb(76, 217, 100), 5%);
}


.swipeout-list-item {
  flex: 1;
  border-bottom: 1px solid lightgray;
}

.swipeout-list-item:last-of-type {
    border-bottom: none;
}

.card {
  width: 100%;
  background-color: white;
  border-radius: 3px;
  box-shadow: none;
  border: 1px solid lightgray;
}
.card-content {
  padding: 1rem;
}
.transition-right {
	transform: translate3d(100%, 0 ,0) !important;
}
.transition-left {
	transform: translate3d(-100%, 0 ,0) !important;
}

.toolbar {
	display: flex;
	align-items: center;
}

.toolbar .toolbar-section {
	flex: 0 0 auto;
}

.toolbar .toolbar-section--center {
	flex: 1000 1 0%;
}

</style>
