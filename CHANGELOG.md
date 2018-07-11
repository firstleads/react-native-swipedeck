## 0.5.0

7/11/18

- fixes animations on cards when buttons are pressed
- disables buttons while animation happens
- removes internal list of cards, instead relying on caller to prune the list of cards that gets passed in when one is removed (AKA this is now a controlled component)
- `onCardRemoved` prop signature was changed from `(card, from) => boolean` to `() => void` because the parameters weren't particularly useful on that prop
- Component is now type generic, means that it expects the `cards` prop to be `Array<T>` and refers to individual cards as `T`. This requires no change for the caller, but provides a lot more type hints than before.
- `cardKey` prop is now a function that takes the card and returns a key: `(card: T) => React.Key` instead of a plain string.
- TS 2.9 provides a lot better support for React idioms, and required props that have defaults are supported now. This allows the removal of a lot of `!`s from the code. This means we're no longer overriding the type system, which is a Good Thing™.
- Cancellable animations for left and right swipes now behave identically, whereas before the right animation was a lot more simplistic than the left.
- [internal] set `skipLibCheck` to true in tsconfig.json because there is currently a conflict between the react-native typedef and the DOM typedef inside of TS itself.

## 0.3.0

1/18/2018

- Migrated to TypeScript
- Fix stuttering animation when card is swiped right or when left button was pressed
- fixed various errors

## 0.3.0-beta.14

11/28/2017

- Bugfix: crash when no `render<Direction>Button` props were passed

## 0.3.0-beta.13

11/20/2017

- Pass index along to `renderCard(card, index)` so that it's easier to create unique `testID`s.
