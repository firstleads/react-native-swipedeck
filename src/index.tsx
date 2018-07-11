/* Gratefully copied from https://github.com/brentvatne/react-native-animated-demo-tinder */
import React, { Component } from 'react'

import {
  StyleSheet,
  Text,
  Button,
  View,
  Animated,
  PanResponder,
  PanResponderInstance,
  TextStyle,
  ViewStyle,
  Platform,
} from 'react-native'

import clamp from 'clamp'

import { NoMoreCards } from './no-more-cards'

const SWIPE_THRESHOLD = 120

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginHorizontal: 10,
    zIndex: 0,
  },
  right: {
    borderColor: 'green',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    bottom: 20,
    borderRadius: 5,
    right: 0,
    zIndex: 3,
    elevation: 40,
  },
  rightText: {
    fontSize: 16,
    color: 'green',
  },
  up: {
    borderColor: 'blue',
    borderWidth: 2,
    position: 'absolute',
    padding: 20,
    bottom: 20,
    borderRadius: 5,
    right: 20,
    zIndex: 3,
    elevation: 40,
  },
  upText: {
    fontSize: 16,
    color: 'blue',
  },
  left: {
    borderColor: 'red',
    borderWidth: 2,
    position: 'absolute',
    bottom: 20,
    padding: 20,
    borderRadius: 5,
    left: 0,
    zIndex: 3,
    elevation: 40,
  },
  leftText: {
    fontSize: 16,
    color: 'red',
  },
})

export type SwipeDirection = 'left' | 'up' | 'right'
export type SwipeHandler<T> = (
  card: T,
  method: 'swipe' | 'button_press',
) => boolean | Promise<boolean>
export type ButtonRenderer = (
  { onPress, disabled }: { onPress: () => void; disabled: boolean },
) => React.ReactNode

export interface Props<T extends React.ReactNode = React.ReactNode> {
  cardKey: (card: T) => React.Key
  cards: Array<T>
  dragY: boolean
  hasUpAction: boolean
  leftStyle: ViewStyle
  leftText: string
  leftTextStyle: TextStyle
  leftView: React.ReactNode
  loop: boolean
  noView: React.ReactNode
  onCardRemoved: () => void
  onDragRelease: (direction?: SwipeDirection) => void
  onDragStart: () => void
  onLeftPress: () => void
  onLeftSwipe: SwipeHandler<T>
  onLoop: () => void
  onRightPress: () => void
  onRightSwipe: SwipeHandler<T>
  onSwipeCancelled: (card: any) => boolean
  onUpSwipe: SwipeHandler<T>
  renderCard: React.StatelessComponent
  renderLeft: (pan: Animated.ValueXY) => React.ReactNode
  renderLeftButton: ButtonRenderer
  renderNoMoreCards: () => React.ReactNode
  renderRight: (pan: Animated.ValueXY) => React.ReactNode
  renderRightButton: ButtonRenderer
  renderUp: (pan: Animated.ValueXY) => React.ReactNode
  renderUpButton: ButtonRenderer
  rightStyle: ViewStyle
  rightText: string
  rightTextStyle: TextStyle
  rightView: React.ReactNode
  showRight: boolean
  showUp: boolean
  showleft: boolean
  smoothTransition: boolean
  stack: boolean
  stackDepth: number
  stackOffsetX: number
  stackOffsetY: number
  offsetY: number
  upStyle: ViewStyle
  upText: string
  upTextStyle: TextStyle
  upView: React.ReactNode
}
export type AnimatedValue = Animated.Value & { _value: number }
export type AnimatedValueXY = Animated.ValueXY & {
  x: AnimatedValue
  y: AnimatedValue
}
export interface State {
  pan: AnimatedValueXY
  enter: Animated.Value
  buttonsDisabled: boolean
}

export default class SwipeCards<T> extends Component<Props<T>, State> {
  public static defaultProps = {
    cards: [],
    dragY: true,
    hasUpAction: false,
    leftText: 'Nope!',
    loop: false,
    onCardRemoved: () => {},
    onDragRelease: () => {},
    onDragStart: () => {},
    onLeftPress: () => false,
    onLeftSwipe: () => false,
    onLoop: () => null,
    onRightPress: () => false,
    onRightSwipe: () => false,
    onSwipeCancelled: () => false,
    onUpSwipe: () => false,
    renderCard: () => null,
    rightText: 'Yup!',
    showleft: true,
    showRight: true,
    showUp: true,
    smoothTransition: false,
    stack: false,
    stackDepth: 5,
    stackOffsetX: 25,
    stackOffsetY: 0,
    offsetY: 0,
    upText: 'Maybe!',
  }
  lastX: number
  lastY: number
  cardAnimation: Animated.CompositeAnimation | null | void
  _panResponder: PanResponderInstance

  constructor(props: Props<T>) {
    super(props)

    this.state = {
      pan: new Animated.ValueXY({ x: 0, y: 0 }) as AnimatedValueXY,
      enter: new Animated.Value(0.5),
      buttonsDisabled: false,
    }

    this.lastX = 0
    this.lastY = 0

    this.cardAnimation = null

    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_e, gestureState) => {
        if (Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3) {
          this.props.onDragStart()
          return true
        }
        return false
      },

      onPanResponderGrant: () => {
        this.state.pan.setOffset({
          x: this.state.pan.x._value,
          y: this.state.pan.y._value,
        })
        this.state.pan.setValue({ x: 0, y: 0 })
      },

      onPanResponderMove: Animated.event([
        null,
        {
          dx: this.state.pan.x,
          dy: this.props.dragY ? this.state.pan.y : new Animated.Value(0),
        },
      ]),

      onPanResponderRelease: (e, { vx, vy, dx }) => {
        this.state.pan.flattenOffset()
        let velocity: number

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
          let cancelled = Promise.resolve(false)

          const hasMovedRight =
            hasSwipedHorizontally && this.state.pan.x._value > 0
          const hasMovedLeft =
            hasSwipedHorizontally && this.state.pan.x._value < 0
          const hasMovedUp = hasSwipedVertically && this.state.pan.y._value < 0

          if (hasMovedRight) {
            this.props.onDragRelease('right')
            cancelled = Promise.resolve(
              this.props.onRightSwipe(this.getCurrentCard(), 'swipe'),
            )
          } else if (hasMovedLeft) {
            this.props.onDragRelease('left')
            cancelled = Promise.resolve(
              this.props.onLeftSwipe(this.getCurrentCard(), 'swipe'),
            )
          } else if (hasMovedUp && this.props.hasUpAction) {
            this.props.onDragRelease('up')
            cancelled = Promise.resolve(
              this.props.onUpSwipe(this.getCurrentCard(), 'swipe'),
            )
          } else {
            this.props.onDragRelease()
            cancelled = Promise.resolve(true)
          }

          //Right or left was cancelled, return the card to normal.
          cancelled.then((cancelled: boolean) => {
            if (cancelled) {
              this.props.onSwipeCancelled(this.getCurrentCard())
              this.resetPan()
              return
            }

            if (this.props.smoothTransition) {
              this.advanceState()
            } else {
              this.cardAnimation = Animated.decay(this.state.pan, {
                velocity: { x: velocity, y: vy },
                deceleration: 0.98,
              })
              this.cardAnimation.start((status) => {
                if (status.finished) {
                  this.advanceState()
                } else {
                  this.resetState()
                }

                this.cardAnimation = null
              })
            }

            this.props.onCardRemoved()
          })
        } else {
          this.resetPan()
        }
      },
    })
  }

  componentDidMount() {
    this.animateEntrance()
  }

  componentWillReceiveProps(nextProps: Props<T>) {
    if (nextProps.cards !== this.props.cards) {
      if (this.cardAnimation) {
        this.cardAnimation.stop()
        this.cardAnimation = null
      }
    }
  }

  private forceLeftSwipe = () => {
    const { onCardRemoved, onLeftSwipe } = this.props
    const { pan } = this.state

    const choice = Promise.resolve(
      onLeftSwipe(this.getCurrentCard(), 'button_press'),
    )

    const PAN_VALUE = !!onLeftSwipe ? -50 : -500

    this.cardAnimation = Animated.timing(pan, {
      toValue: { x: PAN_VALUE, y: 0 },
    }).start((status) => {
      this.state.pan.stopAnimation(() => {
        choice
          .then((cancelled: boolean) => {
            if (status.finished && !cancelled) {
              if (this.props.smoothTransition) {
                this.advanceState()
              } else {
                this.cardAnimation = Animated.timing(pan, {
                  toValue: { x: -500, y: 0 },
                }).start((status) => {
                  if (status.finished) {
                    this.advanceState()
                  } else this.resetState()
                })
              }
            } else {
              this.props.onSwipeCancelled(this.getCurrentCard())
              this.resetPan()
            }

            this.cardAnimation = null
          })
          .then(onCardRemoved)
          .then(() => this.setState({ buttonsDisabled: false }))
      })
    })
  }

  private forceUpSwipe = () => {
    const { onCardRemoved } = this.props

    this.cardAnimation = Animated.timing(this.state.pan, {
      toValue: { x: 0, y: 500 },
    }).start((status) => {
      if (
        status.finished &&
        !this.props.onUpSwipe(this.getCurrentCard(), 'button_press')
      ) {
        this.advanceState()
        onCardRemoved()
        this.setState({ buttonsDisabled: false })
      } else {
        this.resetPan()
        this.resetState()
      }

      this.cardAnimation = null
    })
  }

  private forceRightSwipe = () => {
    const { onCardRemoved, onRightSwipe } = this.props
    const { pan } = this.state

    const choice = Promise.resolve(
      onRightSwipe(this.getCurrentCard(), 'button_press'),
    )

    const PAN_VALUE = !!onRightSwipe ? 50 : 500

    this.cardAnimation = Animated.timing(pan, {
      toValue: { x: PAN_VALUE, y: 0 },
    }).start((status) => {
      this.state.pan.stopAnimation(() => {
        choice
          .then((cancelled: boolean) => {
            if (status.finished && !cancelled) {
              if (this.props.smoothTransition) {
                this.advanceState()
              } else {
                this.cardAnimation = Animated.timing(pan, {
                  toValue: { x: 500, y: 0 },
                }).start((status) => {
                  if (status.finished) {
                    this.advanceState()
                  } else this.resetState()
                })
              }
            } else {
              this.props.onSwipeCancelled(this.getCurrentCard())
              this.resetPan()
            }

            this.cardAnimation = null
          })
          .then(onCardRemoved)
          .then(() => this.setState({ buttonsDisabled: false }))
      })
    })
  }

  private onLeftPress = () => {
    if (!this.getCurrentCard()) return

    this.setState(() => ({ buttonsDisabled: true }))
    this.forceLeftSwipe()
  }

  private onRightPress = () => {
    if (!this.getCurrentCard()) return

    this.setState(() => ({ buttonsDisabled: true }))
    this.forceRightSwipe()
  }

  private onUpPress = () => {
    if (!this.getCurrentCard()) return

    this.setState(() => ({ buttonsDisabled: true }))
    this.forceUpSwipe()
  }

  private animateEntrance() {
    Animated.spring(this.state.enter, { toValue: 1, friction: 8 }).start()
  }

  private resetPan() {
    Animated.spring(this.state.pan, {
      toValue: { x: 0, y: 0 },
      friction: 4,
    }).start()
  }

  private resetState() {
    this.state.pan.setValue({ x: 0, y: 0 })
    this.state.enter.setValue(0)
    this.animateEntrance()
  }

  private advanceState() {
    this.state.pan.setValue({ x: 0, y: 0 })
    this.state.enter.setValue(0)
    this.animateEntrance()
  }

  /**
   * Returns current card object
   */
  private getCurrentCard() {
    return this.props.cards[0]
  }

  renderNoMoreCards() {
    if (this.props.renderNoMoreCards) {
      return this.props.renderNoMoreCards()
    }

    return <NoMoreCards />
  }

  /**
   * Renders the cards as a stack with props.stackDepth cards deep.
   */
  renderStack() {
    if (!this.getCurrentCard()) {
      return this.renderNoMoreCards()
    }

    //Get the next stack of cards to render.
    const cards = this.props.cards.slice(0, this.props.stackDepth).reverse()
    console.log(cards, this.props.cards)

    return cards.map((card, i) => {
      const offsetX =
        this.props.stackOffsetX * cards.length - i * this.props.stackOffsetX
      const lastOffsetX = offsetX + this.props.stackOffsetX

      const offsetY =
        this.props.stackOffsetY * cards.length -
        i * this.props.stackOffsetY +
        this.props.offsetY!
      const lastOffsetY = offsetY + this.props.stackOffsetY

      const scale = 0.85 + (0.15 / cards.length) * (i + 1)
      const lastScale = 0.85 + (0.15 / cards.length) * i

      const style = {
        position: 'absolute',
        top: this.state.enter.interpolate({
          inputRange: [0, 1],
          outputRange: [lastOffsetY, offsetY],
        }),
        left: this.state.enter.interpolate({
          inputRange: [0, 1],
          outputRange: [lastOffsetX, offsetX],
        }),
        opacity: i < cards.length - this.props.stackDepth ? 0 : 1,
        transform: [
          {
            scale: this.state.enter.interpolate({
              inputRange: [0, 1],
              outputRange: [lastScale, scale],
            }),
          },
        ],
        elevation: i * 10,
        zIndex: 2,
      }

      //Is this the top card?  If so animate it and hook up the pan handlers.
      if (i + 1 === cards.length) {
        const { pan } = this.state
        const [translateX, translateY] = [pan.x, pan.y]

        const rotate = pan.x.interpolate({
          inputRange: [-200, 0, 200],
          outputRange: ['-30deg', '0deg', '30deg'],
        })

        const animatedCardStyles = {
          ...style,
          transform: [
            { translateX },
            {
              translateY: Platform.select<typeof pan.y | number>({
                ios: translateY,
                android: 0,
              }),
            },
            { rotate: Platform.select<any>({ ios: rotate, android: 0 }) },
            {
              scale: this.state.enter.interpolate({
                inputRange: [0, 1],
                outputRange: [lastScale, scale],
              }),
            },
          ],
        }

        return (
          <Animated.View
            key={this.props.cardKey(card)}
            style={animatedCardStyles}
            {...this._panResponder.panHandlers}
          >
            {this.props.renderCard(card, i)}
          </Animated.View>
        )
      }

      return (
        <Animated.View key={this.props.cardKey(card)} style={style}>
          {this.props.renderCard(card, i)}
        </Animated.View>
      )
    })
  }

  renderCard() {
    if (!this.getCurrentCard()) {
      return this.renderNoMoreCards()
    }

    const { pan, enter } = this.state
    const [translateX, translateY] = [pan.x, pan.y]

    const rotate = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: ['-30deg', '0deg', '30deg'],
    })
    const opacity = pan.x.interpolate({
      inputRange: [-200, 0, 200],
      outputRange: [0.5, 1, 0.5],
    })

    const scale = enter

    const animatedCardStyles = {
      transform: [{ translateX }, { translateY }, { rotate }, { scale }],
      opacity,
    }

    return (
      <Animated.View
        key={'top'}
        style={animatedCardStyles}
        {...this._panResponder.panHandlers}
      >
        {this.props.renderCard(this.getCurrentCard())}
      </Animated.View>
    )
  }

  renderLeft() {
    const { pan } = this.state

    const leftOpacity = pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -(SWIPE_THRESHOLD / 2)],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })
    const leftScale = pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    })
    const animatedleftStyles = {
      transform: [{ scale: leftScale }],
      opacity: leftOpacity,
    }

    if (this.props.renderLeft) {
      return this.props.renderLeft(pan)
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
      extrapolate: 'clamp',
    })
    const upScale = pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    })
    const animatedUpStyles = {
      transform: [{ scale: upScale }],
      opacity: upOpacity,
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
      extrapolate: 'clamp',
    })
    const rightScale = pan.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0.5, 1],
      extrapolate: 'clamp',
    })
    const animatedRightStyles = {
      transform: [{ scale: rightScale }],
      opacity: rightOpacity,
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
    const {
      renderLeftButton,
      renderRightButton,
      renderUpButton,
      onLeftPress,
      onRightPress,
    } = this.props

    return (
      <View style={styles.container}>
        {this.props.stack ? this.renderStack() : this.renderCard()}
        {this.renderLeft()}
        {this.renderUp()}
        {this.renderRight()}
        <View style={styles.buttonContainer}>
          {renderLeftButton ? (
            renderLeftButton({
              onPress: this.onLeftPress,
              disabled: !this.getCurrentCard() || this.state.buttonsDisabled,
            })
          ) : (
            <Button
              color='red'
              title='nope'
              onPress={onLeftPress}
              disabled={!this.getCurrentCard()}
            />
          )}
          {!!renderUpButton &&
            renderUpButton({
              onPress: this.onUpPress,
              disabled: !this.getCurrentCard() || this.state.buttonsDisabled,
            })}
          {renderRightButton ? (
            renderRightButton({
              onPress: this.onRightPress,
              disabled: !this.getCurrentCard() || this.state.buttonsDisabled,
            })
          ) : (
            <Button
              title='yep'
              onPress={onRightPress}
              disabled={!this.getCurrentCard()}
            />
          )}
        </View>
      </View>
    )
  }
}
