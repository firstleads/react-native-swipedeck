/// <reference types="react" />
import React, { Component } from 'react';
import { Animated, PanResponderInstance, TextStyle, ViewStyle } from 'react-native';
export declare type SwipeDirection = 'left' | 'up' | 'right';
export declare type SwipeHandler = (card: any, method: 'swipe' | 'button_press') => boolean;
export declare type ButtonRenderer = ({onPress, disabled}: {
    onPress: () => void;
    disabled: boolean;
}) => React.ReactNode;
export declare type Props = {
    allowGestureTermination: boolean;
    cardKey: string;
    cards: Array<any>;
    dragY: boolean;
    draggingDisabled: boolean;
    guid?: number;
    hasUpAction: boolean;
    leftStyle: ViewStyle;
    leftText?: string;
    leftTextStyle: TextStyle;
    leftView?: React.ReactNode;
    loop: boolean;
    noView?: React.ReactNode;
    onCardRemoved: (card: any, direction: SwipeDirection) => boolean;
    onDragRelease: (direction?: SwipeDirection) => void;
    onDragStart: () => void;
    onLeftPress: () => void;
    onLeftSwipe: SwipeHandler;
    onLoop: () => void;
    onRightPress: () => void;
    onRightSwipe: SwipeHandler;
    onSwipeCancelled: (card: any) => boolean;
    onUpSwipe: SwipeHandler;
    renderCard: React.StatelessComponent;
    renderLeft: (pan: Animated.ValueXY) => React.ReactNode;
    renderLeftButton: ButtonRenderer;
    renderNoMoreCards: () => React.ReactNode;
    renderRight: (pan: Animated.ValueXY) => React.ReactNode;
    renderRightButton: ButtonRenderer;
    renderUp: (pan: Animated.ValueXY) => React.ReactNode;
    renderUpButton: ButtonRenderer;
    rightStyle: ViewStyle;
    rightText?: string;
    rightTextStyle: TextStyle;
    rightView?: React.ReactNode;
    showRight: boolean;
    showUp: boolean;
    showleft: boolean;
    smoothTransition: boolean;
    stack: boolean;
    stackDepth: number;
    stackGuid?: string;
    stackOffsetX: number;
    stackOffsetY: number;
    upStyle: ViewStyle;
    upText: string;
    upTextStyle: TextStyle;
    upView?: React.ReactNode;
};
export declare type AnimatedValue = Animated.Value & {
    _value: number;
};
export declare type AnimatedValueXY = Animated.ValueXY & {
    x: AnimatedValue;
    y: AnimatedValue;
};
export declare type State = {
    pan: AnimatedValueXY;
    enter: Animated.Value;
    cards: Array<any>;
    card: any;
};
export default class SwipeCards extends Component<Props, State> {
    static defaultProps: {
        allowGestureTermination: boolean;
        cardKey: string;
        onCardRemoved: () => null;
        cards: never[];
        dragY: boolean;
        draggingDisabled: boolean;
        onUpSwipe: () => boolean;
        onRightSwipe: () => boolean;
        onLeftSwipe: () => boolean;
        onUpPress: () => boolean;
        onRightPress: () => boolean;
        onLeftPress: () => boolean;
        onSwipeCancelled: () => boolean;
        hasUpAction: boolean;
        leftText: string;
        loop: boolean;
        upText: string;
        onDragRelease: () => void;
        onDragStart: () => void;
        onLoop: () => null;
        renderCard: () => null;
        rightText: string;
        showUp: boolean;
        showRight: boolean;
        showleft: boolean;
        smoothTransition: boolean;
        stack: boolean;
        stackDepth: number;
        stackOffsetX: number;
        stackOffsetY: number;
    };
    guid: number;
    lastX: number;
    lastY: number;
    cardAnimation: Animated.CompositeAnimation | null | void;
    _panResponder: PanResponderInstance;
    constructor(props: Props);
    componentDidMount(): void;
    componentWillReceiveProps(nextProps: Props): void;
    _forceLeftSwipe: () => void;
    _forceUpSwipe: () => void;
    _forceRightSwipe: () => void;
    onLeftPress: () => void;
    onRightPress: () => void;
    onUpPress: () => void;
    _goToNextCard(): void;
    _goToPrevCard(): void;
    _animateEntrance(): void;
    _resetPan(): void;
    _resetState(): void;
    _advanceState(): void;
    /**
     * Returns current card object
     */
    getCurrentCard(): any;
    renderNoMoreCards(): {} | null | undefined;
    /**
     * Renders the cards as a stack with props.stackDepth cards deep.
     */
    renderStack(): {} | null | undefined;
    renderCard(): {} | null | undefined;
    renderLeft(): {} | null | undefined;
    renderUp(): {} | null | undefined;
    renderRight(): {} | null | undefined;
    render(): JSX.Element;
}
