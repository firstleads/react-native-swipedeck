# Swipe Cards for React Native

A [package](https://www.npmjs.com/package/react-native-swipe-cards) based on [@brentvatne](https://github.com/brentvatne/)'s awesome [example](https://github.com/brentvatne/react-native-animated-demo-tinder).


![React Native Swipe Cards](https://github.com/meteor-factory/react-native-tinder-swipe-cards/raw/master/screenshots/swiper-cards.gif
)

## Quick Start
1. `npm install --save react-native-swipe-cards`
2. Create a module e.g. `SwipeCards.js`
3. Import it `import SwipeCards from './SwipeCards.js'`
4. Render it `<SwipeCards style={{flex: 1}} />`

```javascript
// SwipeCards.js
import React, { Component } from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';

import SwipeCards from 'react-native-swipe-cards';

const Card = ({ backgroundColor, text }) => {
  return (
    <View style={[styles.card, {backgroundColor}]}>
      <Text>{text}</Text>
    </View>
  )
}

const NoMoreCards = () => {
  return (
    <View>
      <Text style={styles.noMoreCardsText}>No more cards</Text>
    </View>
  )
}

const Cards = [
  {text: 'Tomato',    backgroundColor: 'red'},
  {text: 'Aubergine', backgroundColor: 'purple'},
  {text: 'Courgette', backgroundColor: 'green'},
  {text: 'Blueberry', backgroundColor: 'blue'},
  {text: 'Umm...',    backgroundColor: 'cyan'},
  {text: 'orange',    backgroundColor: 'orange'},
]

export default class extends Component {
  state = {
      cards: Cards
  }

  onRightSwipe (card) {
    console.log(`Right for ${card.text}`)
  }

  onLeftSwipe (card) {
    console.log(`Left for ${card.text}`)
  }

  onUpSwipe (card) {
    console.log(`Up for ${card.text}`)
  }

  render() {
    return (
      <SwipeCards
        cards={this.state.cards}
        renderCard={(cardData) => <Card {...cardData} />}
        renderNoMoreCards={() => <NoMoreCards />}
        onRightSwipe={this.onRightSwipe}
        onLeftSwipe={this.onLeftSwipe}
        onUpSwipe={this.onUpSwipe}
        hasUpAction
        // If you want a stack of cards instead of one-per-one view, activate stack mode
        // stack={true}
      />
    )
  }
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    height: 300,
  },
  noMoreCardsText: {
    fontSize: 22,
  }
})

```

### More complex example
```javascript
import React from 'react';
import {StyleSheet, Text, View, Image} from 'react-native';


import SwipeCards from 'react-native-swipe-cards';

const Card = ({ image, name }) => {
  return (
    <View style={styles.card}>
      <Image style={styles.thumbnail} source={{uri: image}} />
      <Text style={styles.text}>This is card {name}</Text>
    </View>
  )
}

const NoMoreCards = () => {
  return (
    <View>
      <Text style={styles.noMoreCardsText}>No more cards</Text>
    </View>
  )
}

const Cards = [
  {name: '1', image: 'https://media.giphy.com/media/GfXFVHUzjlbOg/giphy.gif'},
  {name: '2', image: 'https://media.giphy.com/media/irTuv1L1T34TC/giphy.gif'},
  {name: '3', image: 'https://media.giphy.com/media/LkLL0HJerdXMI/giphy.gif'},
  {name: '4', image: 'https://media.giphy.com/media/fFBmUMzFL5zRS/giphy.gif'},
  {name: '5', image: 'https://media.giphy.com/media/oDLDbBgf0dkis/giphy.gif'},
  {name: '6', image: 'https://media.giphy.com/media/7r4g8V2UkBUcw/giphy.gif'},
  {name: '7', image: 'https://media.giphy.com/media/K6Q7ZCdLy8pCE/giphy.gif'},
  {name: '8', image: 'https://media.giphy.com/media/hEwST9KM0UGti/giphy.gif'},
  {name: '9', image: 'https://media.giphy.com/media/3oEduJbDtIuA2VrtS0/giphy.gif'},
]

const Cards2 = [
  {name: '10', image: 'https://media.giphy.com/media/12b3E4U9aSndxC/giphy.gif'},
  {name: '11', image: 'https://media4.giphy.com/media/6csVEPEmHWhWg/200.gif'},
  {name: '12', image: 'https://media4.giphy.com/media/AA69fOAMCPa4o/200.gif'},
  {name: '13', image: 'https://media.giphy.com/media/OVHFny0I7njuU/giphy.gif'},
]

export default class extends Component {
  state = {
      cards: Cards,
      outOfCards: false
  }

  onRightSwipe (card) {
    console.log("right")
  }

  onLeftSwipe (card) {
    console.log("left")
  }

  onCardRemoved (index) {
    console.log(`The index is ${index}`);

    const CARD_REFRESH_LIMIT = 3

    if (this.state.cards.length - index <= CARD_REFRESH_LIMIT + 1) {
      console.log(`There are only ${this.state.cards.length - index - 1} cards left.`);

      if (!this.state.outOfCards) {
        console.log(`Adding ${Cards2.length} more cards`)

        this.setState({
          cards: this.state.cards.concat(Cards2),
          outOfCards: true
        })
      }
    }
  }

  render() {
    return (
      <SwipeCards
        cards={this.state.cards}
        loop={false}

        renderCard={(cardData) => <Card {...cardData} />}
        renderNoMoreCards={() => <NoMoreCards />}
        showRight={true}
        showLeft={true}

        onRightSwipe={this.onRightSwipe}
        onLeftSwipe={this.onLeftSwipe}
        onCardRemoved={this.onCardRemoved}
      />
    )
  }
})

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    borderRadius: 5,
    overflow: 'hidden',
    borderColor: 'grey',
    backgroundColor: 'white',
    borderWidth: 1,
    elevation: 1,
  },
  thumbnail: {
    flex: 1,
    width: 300,
    height: 300,
  },
  text: {
    fontSize: 20,
    paddingTop: 10,
    paddingBottom: 10
  },
  noMoreCards: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
})
```

### Props
| Prop name         | Type                                 | Default  | Description                                                            |
| ----------------- | ------------------------------------ | -------- | ---------------------------------------------------------------------- |
| cardKey           | (card: T) => Key                     |          | React key to be used to for each card                                  |
| cards             | Array<T>                             |          | Data that will be provided as props for the cards                      |
| containerStyle    | style                                |          | Override default style                                                 |
| dragY             | Boolean                              | `true`   | Allows dragging cards vertically                                       |
| draggingDisabled  | Boolean                              | `false`  | Allows dragging or not                                                 |
| hasUpAction       | Boolean                              | `false`  | Includes the possibility to swipe up and its components                |
| leftStyle         | style                                |          | Override default style                                                 |
| leftText          | string                               | `Nope!`  | Text to render on left swipe                                           |
| leftTextStyle     | style                                |          | Override default style                                                 |
| leftView          | ReactNode                            |          | React component to render on a left swipe                              |
| loop              | Boolean                              | `false`  | If true, start again when run out of cards                             |
| onCardRemoved     | () => void                           |          | A callback passing the card reference that just got removed            |
| onLeftSwipe       | SwipeHandler<T>                      |          | Called when card is swiped left. Return true to cancel the animation.  |
| onLoop            | () => void                           |          | Called when card list returns to the beginning                         |
| onRightSwipe      | SwipeHandler<T>                      |          | Called when card is swiped right. Return true to cancel the animation. |
| onSwipeCancelled  | (card: T) => boolean                 |          | Called after a card swipe is cancelled.                                |
| onUpSwipe         | SwipeHandler<T>                      |          | Called when card is swiped up. Return true to cancel the animation.    |
| renderCard        | StatelessComponent                   |          | Renders the card with the current data                                 |
| renderLeft        | (pan: Animated.ValueXY) => ReactNode |          | Renders Left                                                           |
| renderLeftButton  | ButtonRenderer                       |          | Renders Left button. Takes `onPress` and `disabled` props              |
| renderNoMoreCards | StatelessComponent                   |          | Renders what is shown after swiped last card                           |
| renderRight       | (pan: Animated.ValueXY) => ReactNode |          | Renders Right                                                          |
| renderRightButton | ButtonRenderer                       |          | Renders Right Button. Takes `onPress` and `disabled` props             |
| renderUp          | (pan: Animated.ValueXY) => ReactNode |          | Renders Up                                                             |
| renderUpButton    | ButtonRenderer                       |          | Renders Up Button. Takes `onPress` and `disabled` props                |
| rightStyle        | style                                |          | Override default style                                                 |
| rightText         | string                               | `Yup!`   | Text to render on right swipe                                          |
| rightTextStyle    | style                                |          | Override default style                                                 |
| rightView         | ReactNode                            |          | React component to render on a right swipe                             |
| showLeft          | Boolean                              | `true`   | Shows the 'Left' label                                                 |
| showRight         | Boolean                              | `true`   | Shows the 'Right' label                                                |
| showUp            | Boolean                              | `true`   | Shows the 'Up' label                                                   |
| smoothTransition  | Boolean                              | `false`  | Disables a slow transition fading the current card out                 |
| stack             | Boolean                              | `false`  | Enables the stack mode                                                 |
| stackOffsetX      | Number                               | 25       | Horizontal offset between cards in stack                               |
| stackOffsetY      | Number                               | 0        | Vertical offset between cards in stack                                 |
| upStyle           | style                                |          | Override default style                                                 |
| upText            | string                               | `Maybe!` | Text to render on Up swipe                                             |
| upTextStyle       | style                                |          | Override default style                                                 |
| upView            | ReactNode                            |          | React component to render on a Up swipe                                |

### Todo (PRs welcome!)
- [ ] Testing
