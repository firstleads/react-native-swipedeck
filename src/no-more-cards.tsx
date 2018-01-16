'use strict'

import React, { Component } from 'react'

import { StyleSheet, Text, View, Image } from 'react-native'

export class NoMoreCards extends Component {
  render() {
    return (
      <View>
        <Text style={styles.noMoreCardsText}>No more cards</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  noMoreCardsText: {
    fontSize: 22,
  },
})
