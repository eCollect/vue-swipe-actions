# vue-swipe-actions

**iOS style swipe actions for Vue.js, [Live Demo](https://ecollect.github.io/vue-swipe-actions/)** ([Source](https://github.com/eCollect/vue-swipe-actions/blob/master/src/App.vue))

## Installation

```
npm install --save vue-swipe-actions
```

```js
import { SwipeList, SwipeOut } from 'vue-swipe-actions';

export default {
  components: {
    SwipeOut,
    SwipeList
  }
};
```

## Basic Usage

### Import Styles

```javascript
import 'vue-swipe-actions/dist/vue-swipe-actions.css';
```

### SwipeList

SwipeList component is just a helper for listing multiple SwipeOuts.

#### Props

| Prop             | Data Type | Required|Default| Description        |
| ---------------- | --------- |-------- |-------|------------------ |
| `items`          | Array     | *       |       | An array with your data |
| `transition-key` | String    |         |id     | Your key for :key when list is v-for-ed, if not found array index will used|
| `disabled`       | Boolean   |         |false  | if true items will be disabled, and text selection will be possible (on desktop). adds class ``swipeout--disabled``  |
| `threshold`      | Number    |         |45     | With that property you can fine tune when actions are considered open |

#### Events

| Prop                    | Payload         | Description        |
| ----------------------- | --------------- | -|
| `swipeout:click`        | { event, item } | Emitted on single click/tap on the item |
| `swipeout:doubleclick`  | { event, item } | Emitted on double click/tap on the item |
| `active`                | Boolean         | Emitted when the user is opening/closing the any of the actions |


### SwipeOut

SwipeOut is the main component, representing a single item with it's actions.

#### Props

| Prop             | Data Type | Required|Default| Description        |
| ---------------- | --------- |-------- |-------|------------------ |
| `disabled`       | Boolean   |         |false  | if true items will be disabled, and text selection will be possible (on desktop). adds class ``swipeout--disabled``  |
| `threshold`      | Number    |         |45     | With that property you can fine tune when actions are considered open |

#### Events

| Prop                    | Payload         | Description        |
| ----------------------- | --------------- | -|
| `swipeout:click`        | event | Emitted on single click/tap on the item |
| `swipeout:doubleclick`  | event | Emitted on double click/tap on the item |
| `active`                | Boolean         | Emitted when the user is opening/closing the any of the actions |

```html
<swipe-list :items="mockSwipeList" transition-key="id" @swipeout:contentclick="contentClick" @swipeout:click="itemClick" @swipeout:doubleclick="itemDblClick">
  <template slot-scope="{ item, index, revealLeft, revealRight, close }">
    <!-- item is the corresponding object from the array -->
    <!-- index is clearly the index -->
    <!-- revealLeft is method which toggles the left side -->
    <!-- revealRight is method which toggles the right side -->
    <!-- close is method which closes an opened side -->
    <div class="card-content">
      <!-- style content how ever you like -->
      <h2>{{ item.title }}</h2>
      <p>{{ item.description }}</p>
      <span>{{ index }}</span>
    </div>
  </template>
  <template slot="left" slot-scope="{ item, close }">
      <!-- remove <template slot="left" slot-scope="{ item }"> if you dont wanna have left swipe side  -->
      <!-- close is method which closes an opened side -->
      <div class="swipeout-action">
        <!-- place icon here or what ever you want -->
        <i class="fa fa-cloud"></i>
      </div>
      <div class="swipeout-action">
        <!-- place icon here or what ever you want -->
        <i class="fa fa-file"></i>
      </div>
  </template>
  <template slot="right" slot-scope="{ item, close }">
      <!-- remove <template slot="right" slot-scope="{ item }"> if you dont wanna have right swipe side  -->
      <!-- close is method which closes an opened side -->
      <div class="swipeout-action">
        <!-- place icon here or what ever you want -->
        <i class="fa fa-heart"></i>
      </div>
  </template>
  <div slot="empty">
    <!-- change mockSwipeList to an empty array to see this slot in action  -->
    list is empty ( filtered or just empty )
  </div>
</swipe-list>
```

```js
components: {
  SwipeOut,
  SwipeList,
},
data() {
  return {
    mockSwipeList: [
      {
        id: 0,
        key1: 'key1',
        key2: 'key2',
        key3: 'key3',
        key4: 'key4',
      },
      {
        id: 1,
        key1: 'key1',
        key2: 'key2',
        key3: 'key3',
        key4: 'key4',
      },
      {
        id: 2,
        key1: 'key1',
        key2: 'key2',
        key3: 'key3',
        key4: 'key4',
      },
    ],
  };
},
methods: {
  contentClick(e) {
    console.log(e, 'content click');
  },
  itemClick(e) {
    console.log(e, 'item click');
  },
  itemDblClick(e) {
    console.log(e, 'item double click');
  },
  fbClick(e) {
    console.log(e, 'First Button Click');
  },
  sbClick(e) {
    console.log(e, 'Second Button Click');
  },
},
```

### Styling

The default styling is as minimal as possible, defining no visual styles but only functional ones.
You can overwrite any of the styles if needed.

```css
.swipeout {
  position: relative;
  overflow: hidden;
  user-select: none;
  display: flex;
}
.swipeout.swipeout--disabled {
  user-select: auto;
}
.swipeout .swipeout-left,
.swipeout .swipeout-right {
  position: absolute;
  height: 100%;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  z-index: 1;
}
.swipeout.swipeout--transitioning .swipeout-action,
.swipeout.swipeout--transitioning .swipeout-content {
  transition: transform 0.3s;
}
.swipeout .swipeout-content {
  width: 100%;
}
.swipeout .swipeout-action,
.swipeout .swipeout-content {
  will-change: transform;
}
.swipeout .swipeout-left {
  left: 0;
  transform: translateX(-100%);
}
.swipeout .swipeout-right {
  right: 0;
  transform: translateX(100%);
}
.swipeout-list-item {
  outline: none;
}
```

## Author

&#169; 2018 eCollect AG.
