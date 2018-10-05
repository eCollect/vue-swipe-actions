<template>
  <div id="app">
    <button @click="lessIsMore">less buttons</button>
    <swipe-list class="card" :items="mockSwipeList" transition-key="id" @swipeout:contentclick="contentClick" @swipeout:click="itemClick" @swipeout:doubleclick="itemDblClick">
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
      <!-- left swipe side template and slot-scope="{ item }" is the item clearly -->
      <!-- remove <template slot="left" slot-scope="{ item }"> if you dont wanna have left swipe side  -->
      <template slot="left" slot-scope="{ item }">
        <div class="swipeout-action red">
          <!-- place icon here or what ever you want -->
          <i class="fa fa-cloud"></i>
        </div>
        <div  class="swipeout-action purple">
          <!-- place icon here or what ever you want -->
          <i class="fa fa-file"></i>
        </div>
      </template>
      <!-- right swipe side template and slot-scope="{ item }" is the item clearly -->
      <!-- remove <template slot="right" slot-scope="{ item }"> if you dont wanna have right swipe side  -->
      <template slot="right" slot-scope="{ item }">
        <div class="swipeout-action blue">
          <!-- place icon here or what ever you want -->
          <i class="fa fa-heart"></i>
        </div>
        <div v-if="!less" class="swipeout-action green">
          <!-- place icon here or what ever you want -->
          <i class="fa fa-heart"></i>
        </div>
      </template>
      <div slot="empty">
        <!-- change mockSwipeList to an empty array to see this slot in action  -->
        list is empty ( filtered or just empty )
      </div>
    </swipe-list>
  </div>
</template>

<script>
  /* eslint-disable */
  import { SwipeList, SwipeOut } from './components/index';

  export default {
    name: 'app',
    components: {
      SwipeOut,
      SwipeList,
    },
    data() {
      return {
        less: false,
        mockSwipeList: [
          {
            id: 0,
            title: 'Some title',
            description: 'some description',
          },
          {
            id: 1,
            title: 'Some title',
            description: 'some description',
          },
          {
            id: 2,
            title: 'Some title',
            description: 'some description',
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
      lessIsMore() {
        this.less = true;
      }
    },
}
</script>
<style lang="scss">
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css");

.swipeout-list {
	display: flex;
	flex-direction: column;
}
.swipeout-action {
    display: flex;
    align-items: center;
    padding: 0 3rem;
    cursor: pointer;
    left: 0;
    // https://developer.apple.com/design/human-interface-guidelines/ios/visual-design/color/
    &.blue {
      color: white;    
      background-color: rgb(0,122,255);
        &:hover {
          background-color: darken(rgb(0,122,255), 5%);
        }
    }
    &.purple {
      color: white;    
      background-color: rgb(88,86,214);
        &:hover {
        background-color: darken(rgb(88,86,214), 5%);
        }
    }
    &.red {
      color: white;    
      background-color: rgb(255,59,48);
        &:hover {
        background-color: darken(rgb(255,59,48), 5%);
        }
    }
    &.green {
      color: white;    
      background-color: rgb(76,217,100);
        &:hover {
        background-color: darken(rgb(76,217,100), 5%);
        }
    }
}
.swipeout-list-item {
	flex: 1;
	border-bottom: 1px solid lightgray;
	&:last-of-type {
		border-bottom: none;
	}
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
</style>
