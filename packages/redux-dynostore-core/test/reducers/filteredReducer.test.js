/**
 * Copyright 2018, IOOF Holdings Limited.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { combineReducers } from 'redux'
import filteredReducer from 'src/reducers/filteredReducer'

describe('filteredReducer Tests', () => {
  const primative = (state = 0) => state
  const plainObject = (state = { test: 'value' }) => state
  const array = (state = ['value']) => state
  const changingState = (state = {}, action) => (action.type == 'ADD_STATE' ? { ...state, test: 'value' } : state)
  const replacingReducer = (state = { test: null }) => state

  const testCases = [
    {
      name: 'combined',
      reducer: () => combineReducers({ primative, plainObject }),
      initialState: { primative: 1, plainObject: { test: 'other' } },
      expectedState1: { primative: 0, plainObject: { test: 'value' } },
      expectedState2: { primative: 0, plainObject: { test: 'value' } },
      expectedState3: { primative: 1, plainObject: { test: 'other' } },
      expectedState4: { primative: 1, plainObject: { test: 'other' } }
    },
    {
      name: 'primative',
      reducer: () => primative,
      initialState: 1,
      expectedState1: 0,
      expectedState2: 0,
      expectedState3: 1,
      expectedState4: 1
    },
    {
      name: 'plain object',
      reducer: () => plainObject,
      initialState: { test: 'other' },
      expectedState1: { test: 'value' },
      expectedState2: { test: 'value' },
      expectedState3: { test: 'other' },
      expectedState4: { test: 'other' }
    },
    {
      name: 'array',
      reducer: () => array,
      initialState: ['other'],
      expectedState1: ['value'],
      expectedState2: ['value'],
      expectedState3: ['other'],
      expectedState4: ['other']
    },
    {
      name: 'changing state',
      reducer: () => changingState,
      initialState: { test: 'other' },
      expectedState1: {},
      expectedState2: { test: 'value' },
      expectedState3: { test: 'other' },
      expectedState4: { test: 'value' }
    },
    {
      name: 'replacing reducer',
      reducer: () => replacingReducer,
      initialState: { test: 'value' },
      expectedState1: { test: null },
      expectedState2: { test: null },
      expectedState3: { test: 'value' },
      expectedState4: { test: 'value' }
    }
  ]

  testCases.forEach(testCase => {
    describe(`${testCase.name} reducers`, () => {
      test('should filter', () => {
        const reducer = filteredReducer(testCase.reducer())
        const state = reducer(undefined, {})

        expect(state).toEqual(testCase.expectedState1)
      })

      test('should filter and handle actions', () => {
        const reducer = filteredReducer(testCase.reducer())
        const initialState = reducer(undefined, {})
        const state = reducer(initialState, { type: 'ADD_STATE' })

        expect(state).toEqual(testCase.expectedState2)
      })

      test('should filter with initial state', () => {
        const reducer = filteredReducer(testCase.reducer())
        const state = reducer(testCase.initialState, {})

        expect(state).toEqual(testCase.expectedState3)
      })

      test('should filter with initial state and handle actions', () => {
        const reducer = filteredReducer(testCase.reducer())
        const state = reducer(testCase.initialState, { type: 'ADD_STATE' })

        expect(state).toEqual(testCase.expectedState4)
      })
    })
  })

  test('should use override state handler', () => {
    const stateHandler = {
      createEmpty: () => ({}),
      getKeys: state => [...Object.keys(state), 'custom'],
      getValue: (state, key) => key === 'custom' ? true : state[key],
      setValue: (state, key, value) => {
        state[key] = value
        return state
      }
    }

    const reducer = filteredReducer(changingState, { stateHandler })

    const state = reducer({ test: 'wrong' }, { type: 'ADD_STATE' })

    expect(state).toEqual({ test: 'value', custom: true })
  })
})
