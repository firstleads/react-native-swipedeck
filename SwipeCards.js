// @flow

/* Gratefully copied from https://github.com/brentvatne/react-native-animated-demo-tinder */
import React, { Component } from 'react'

import { StyleSheet, Text, View, Animated, PanResponder } from 'react-native'

import clamp from 'clamp'

import Defaults from './Defaults'

const SWIPE_THRESHOLD = 120

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  right: {
    borderColor: 'green',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    bottom: 20,
    borderRadius: 5,
    right: 0
  },
  rightText: {
    fontSize: 16,
    color: 'green'
  },
  up: {
    borderColor: 'blue',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    bottom: 20,
    borderRadius: 5,
    right: 20
  },
  upText: {
    fontSize: 16,
    color: 'blue'
  },
  left: {
    borderColor: 'red',
    borderWidth: 2,
    position: 'absolute',
    bottom: 20,
    padding: 20,
    borderRadius: 5,
    left: 0
  },
  leftText: {
    fontSize: 16,
    color: 'red'
  }
})

//Components could be unloaded and loaded and we will loose the users currentIndex, we can persist it here.
const currentIndex = {}
let guid = 0

type Props = {
  allowGestureTermination: boolean,
  cardKey: string,
  cardRemoved: Function,
  cards: Array<*>,
  dragY: boolean,
  handleUp: Function,
  handleRight: Function,
  handleleft: Function,
  hasUpAction: boolean,
  leftText: string,
  loop: boolean,
  upText: string,
  upView: React.Element<*>,
  noView: React.Element<*>,
  onLoop: Function,
  onPush: Function,
  renderCard: Function,
  renderNoMoreCards: Function,
  rightText: string,
  rightView: React.Element<*>,
  showUp: boolean,
  showRight: boolean,
  showleft: boolean,
  smoothTransition: boolean,
  stack: boolean,
  stackDepth: number,
  stackGuid: string,
  stackOffsetX: number,
  stackOffsetY: number
}
export default class SwipeCards extends Component<Props> {
  static defaultProps = {
    allowGestureTermination: true,
    cardKey: 'key',
    cardRemoved: () => null,
    cards: [],
    dragY: true,
    handleUp: () => null,
    handleRight: () => null,
    handleleft: () => null,
    hasUpAction: false,
    leftText: 'Nope!',
    loop: false,
    upText: 'Maybe!',
    onDragRelease: () => {},
    onDragStart: () => {},
    onLoop: () => null,
    onPush: () => alert('tap'),
    renderCard: () => null,
    rightText: 'Yup!',
    showUp: true,
    showRight: true,
    showleft: true,
    smoothTransition: false,
    stack: false,
    stackDepth: 5,
    stackOffsetX: 25,
    stackOffsetY: 0,
    style: styles.container
  }

  constructor(props) {
    super(props)

    //Use a persistent variable to track currentIndex instead of a local one.
    this.guid = this.props.guid || guid++
    if (!currentIndex[this.guid]) currentIndex[this.guid] = 0

    this.state = {
      pan: new Animated.ValueXY(0),
      enter: new Animated.Value(0.5),
      cards: [].concat(this.props.cards),
      card: this.props.cards[currentIndex[this.guid]]
    }

    this.lastX = 0
    this.lastY = 0

    this.cardAnimation = null

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (e, gestureState) => {
        if (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3) {
          this.props.onDragStart()
          return true
        }
        return false
      },

      onPanResponderGrant: (e, gestureState) => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value
        })
        this.state.pan.setValue({ x: 0, y: 0 })
      },

      onPanResponderTerminationRequest: (evt, gestureState) =>
        this.props.allowGestureTermination,

      onPanResponderMove: Animated.event([
        null,
        { dx: this.state.pan.x, dy: this.props.dragY ? this.state.pan.y : 0 }
      ]),

      onPanResponderRelease: (e, { vx, vy, dx, dy }) => {
        this.props.onDragRelease()
        this.state.pan.flattenOffset()
        let velocity
        if (Math.abs(dx) <= 5 && Math.abs(dy) <= 5) {
          //meaning the gesture did not cover any distance
          this.props.onPush(this.state.card)
        }

        if (vx > 0) {
          velocity = clamp(vx, 3, 5)
        } else if (vx < 0) {
          velocity = clamp(vx * -1, 3, 5) * -1
        } else {
          velocity = dx < 0 ? -3 : 3
        }

        const hasSwipedHorizontally =
          Math.abs(this.state.pan.x._value) > SWIPE_THRESHOLD
        const hasSwipedVertically =
          Math.abs(this.state.pan.y._value) > SWIPE_THRESHOLD
        if (
          hasSwipedHorizontally ||
          (hasSwipedVertically && this.props.hasUpAction)
        ) {
          let cancelled = false

          const hasMovedRight =
            hasSwipedHorizontally && this.state.pan.x._value > 0
          const hasMovedLeft =
            hasSwipedHorizontally && this.state.pan.x._value < 0
          const hasMovedUp = hasSwipedVertically && this.state.pan.y._value < 0

          if (hasMovedRight) {
            cancelled = this.props.handleRight(this.state.card)
          } else if (hasMovedLeft) {
            cancelled = this.props.handleleft(this.state.card)
          } else if (hasMovedUp && this.props.hasUpAction) {
            cancelled = this.props.handleUp(this.state.card)
          } else {
            cancelled = true
          }

          //Right or left was cancelled, return the card to normal.
          if (cancelled) {
            this._resetPan()
            return
          }

          this.props.cardRemoved(currentIndex[this.guid])

          if (this.props.smoothTransition) {
            this._advanceState()
          } else {
            this.cardAnimation = Animated.decay(this.state.pan, {
              velocity: { x: velocity, y: vy },
              deceleration: 0.98
            })
            this.cardAnimation.start(status => {
              if (status.finished) this._advanceState()
              else this._resetState()

              this.cardAnimation = null
            })
          }
        } else {
          this._resetPan()
        }
      }
    })
  }

  componentDidMount() {
    this._animateEntrance()
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.cards !== this.props.cards) {
      if (this.cardAnimation) {
        this.cardAnimation.stop()
        this.cardAnimation = null
      }

      currentIndex[this.guid] = 0
      this.setState({
        cards: [].concat(nextProps.cards),
        card: nextProps.cards[0]
      })
    }
  }

  _forceLeftSwipe() {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: { x: -500, y: 0 }
    }).start(status => {
      if (status.finished) this._advanceState()
      else this._resetState()

      this.cardAnimation = null
    })
    this.props.cardRemoved(currentIndex[this.guid])
  }

  _forceUpSwipe() {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: { x: 0, y: 500 }
    }).start(status => {
      if (status.finished) this._advanceState()
      else this._resetState()

      this.cardAnimation = null
    })
    this.props.cardRemoved(currentIndex[this.guid])
  }

  _forceRightSwipe() {
    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: { x: 500, y: 0 }
    }).start(status => {
      if (status.finished) this._advanceState()
      else this._resetState()

      this.cardAnimation = null
    })
    this.props.cardRemoved(currentIndex[this.guid])
  }

  _goToNextCard() {
    currentIndex[this.guid]++

    // Checks to see if last card.
    // If props.loop=true, will start again from the first card.
    if (
      currentIndex[this.guid] > this.state.cards.length - 1 &&
      this.props.loop
    ) {
      this.props.onLoop()
      currentIndex[this.guid] = 0
    }

    this.setState({
      card: this.state.cards[currentIndex[this.guid]]
    })
  }

  _goToPrevCard() {
    this.state.pan.setValue({ x: 0, y: 0 })
    this.state.enter.setValue(0)
    this._animateEntrance()

    currentIndex[this.guid]--

    if (currentIndex[this.guid] < 0) {
      currentIndex[this.guid] = 0
    }

    this.setState({
      card: this.state.cards[currentIndex[this.guid]]
    })
  }

  _animateEntrance() {
    Animated.spring(this.state.enter, { toValue: 1, friction: 8 }).start()
  }

  _resetPan() {
    Animated.spring(this.state.pan, {
      toValue: { x: 0, y: 0 },
      friction: 4
    }).start()
  }

  _resetState() {
    this.state.pan.setValue({ x: 0, y: 0 })
    this.state.enter.setValue(0)
    this._animateEntrance()
  }

  _advanceState() {
    this.state.pan.setValue({ x: 0, y: 0 })
    this.state.enter.setValue(0)
    this._animateEntrance()
    this._goToNextCard()
  }

  /**
   * Returns current card object
   */
  getCurrentCard() {
    return this.state.cards[currentIndex[this.guid]]
  }

  renderNoMoreCards() {
    if (this.props.renderNoMoreCards) {
      return this.props.renderNoMoreCards()
    }

    return <Defaults.NoMoreCards />
  }

  /**
   * Renders the cards as a stack with props.stackDepth cards deep.
   */
  renderStack() {
    if (!this.state.card) {
      return this.renderNoMoreCards()
    }

    //Get the next stack of cards to render.
    const cards = this.state.cards
      .slice(
        currentIndex[this.guid],
        currentIndex[this.guid] + this.props.stackDepth
      )
      .reverse()

    return cards.map((card, i) => {
      const offsetX =
        this.props.stackOffsetX * cards.length - i * this.props.stackOffsetX
      const lastOffsetX = offsetX + this.props.stackOffsetX

      const offsetY =
        this.props.stackOffsetY * cards.length - i * this.props.stackOffsetY
      const lastOffsetY = offsetY + this.props.stackOffsetY

      const opacity = 0.25 + 0.75 / cards.length * (i + 1)
      const lastOpacity = 0.25 + 0.75 / cards.length * i

      const scale = 0.85 + 0.15 / cards.length * (i + 1)
      const lastScale = 0.85 + 0.15 / cards.length * i

      const style = {
        position: 'absolute',
        top: this.state.enter.interpolate({
          inputRange: [0, 1],
          outputRange: [lastOffsetY, offsetY]
        }),
        left: this.state.enter.interpolate({
          inputRange: [0, 1],
          outputRange: [lastOffsetX, offsetX]
        }),
        opacity: this.props.smoothTransition
          ? 1
          : this.state.enter.interpolate({
              inputRange: [0, 1],
              outputRange: [lastOpacity, opacity]
            }),
        transform: [
          {
            scale: this.state.enter.interpolate({
              inputRange: [0, 1],
              outputRange: [lastScale, scale]
            })
          }
        ],
        elevation: i * 10
      }

      //Is this the top card?  If so animate it and hook up the pan handlers.
      if (i + 1 === cards.length) {
        const { pan } = this.state
        const [translateX, translateY] = [pan.x, pan.y]

        const rotate = pan.x.interpolate({
          inputRange: [-200, 0, 200],
          outputRange: ['-30deg', '0deg', '30deg']
        })
        const opacity = this.props.smoothTransition
          ? 1
          : pan.x.interpolate({
              inputRange: [-200, 0, 200],
              outputRange: [0.5, 1, 0.5]
            })

        const animatedCardStyles = {
          ...style,
          transform: [
            { translateX: translateX },
            { translateY: translateY },
            { rotate: rotate },
            {
              scale: this.state.enter.interpolate({
                inputRange: [0, 1],
                outputRange: [lastScale, scale]
              })
            }
          ]
        }

        return (
          <Animated.View
            key={card[this.props.cardKey]}
            style={[styles.card, animatedCardStyles]}
            {...this._panResponder.panHandlers}
          >
            {this.props.renderCard(this.state.card)}
          </Animated.View>
        )
      }

      return (
        <Animated.View key={card[this.props.cardKey]} style={style}>
          {this.props.renderCard(card)}
        </Animated.View>
      )
    })
  }

  renderCard() {
    if (!this.state.card) {
      return this.renderNoMoreCards()
    }

    const { pan, enter } = this.state
    const [translateX, translateY] = [pan.x, pan.y]

    const rotate = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['-30deg', '0deg', '30deg']
    })
    const opacity = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: [0.5, 1, 0.5]
    })

    const scale = enter

    const animatedCardStyles = {
      transform: [{ translateX }, { translateY }, { rotate }, { scale }],
      opacity
    }

    return (
      <Animated.View
        key={'top'}
        style={[styles.card, animatedCardStyles]}
        {...this._panResponder.panHandlers}
      >
        {this.props.renderCard(this.state.card)}
      </Animated.View>
    )
  }

  renderleft() {
    const { pan } = this.state

    const leftOpacity = pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -(SWIPE_THRESHOLD / 2)],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    const leftScale = pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    const animatedleftStyles = {
      transform: [{ scale: leftScale }],
      opacity: leftOpacity
    }

    if (this.props.renderleft) {
      return this.props.renderleft(pan)
    }

    if (this.props.showleft) {
      const inner = this.props.noView ? (
        this.props.noView
      ) : (
        <Text style={[styles.leftText, this.props.leftTextStyle]}>
          {this.props.leftText}
        </Text>
      )

      return (
        <Animated.View
          style={[styles.left, this.props.leftStyle, animatedleftStyles]}
        >
          {inner}
        </Animated.View>
      )
    }

    return null
  }

  renderUp() {
    if (!this.props.hasUpAction) return null

    const { pan } = this.state

    const upOpacity = pan.y.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -(SWIPE_THRESHOLD / 2)],
      outputRange: [1, 0],
      extrapolate: 'clamp'
    })
    const upScale = pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp'
    })
    const animatedUpStyles = {
      transform: [{ scale: upScale }],
      opacity: upOpacity
    }

    if (this.props.renderUp) {
      return this.props.renderUp(pan)
    }

    if (this.props.showUp) {
      const inner = this.props.upView ? (
        this.props.upView
      ) : (
        <Text style={[styles.upText, this.props.upTextStyle]}>
          {this.props.upText}
        </Text>
      )

      return (
        <Animated.View
          style={[styles.up, this.props.upStyle, animatedUpStyles]}
        >
          {inner}
        </Animated.View>
      )
    }

    return null
  }

  renderRight() {
    const { pan } = this.state

    const rightOpacity = pan.x.interpolate({
      inputRange: [SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    })
    const rightScale = pan.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0.5, 1],
      extrapolate: 'clamp'
    })
    const animatedRightStyles = {
      transform: [{ scale: rightScale }],
      opacity: rightOpacity
    }

    if (this.props.renderRight) {
      return this.props.renderRight(pan)
    }

    if (this.props.showRight) {
      const inner = this.props.rightView ? (
        this.props.rightView
      ) : (
        <Text style={[styles.rightText, this.props.rightTextStyle]}>
          {this.props.rightText}
        </Text>
      )

      return (
        <Animated.View
          style={[styles.right, this.props.rightStyle, animatedRightStyles]}
        >
          {inner}
        </Animated.View>
      )
    }

    return null
  }

  render() {
    return (
      <View style={styles.container}>
        {this.props.stack ? this.renderStack() : this.renderCard()}
        {this.renderleft()}
        {this.renderUp()}
        {this.renderRight()}
      </View>
    )
  }
}
