import { useReducer, useEffect } from 'react'
import './styles.css'
import DigitButton from './DigitButton'
import OperationButton from './OperationButton'

export const ACTIONS = {
    ADD_DIGIT: 'add-digit',
    CHOOSE_OPERATION: 'choose-operation',
    CLEAR: 'clear',
    DELETE_DIGIT: 'delete-digit',
    EVALUATE: 'evaluate',
}

function reducer(state, { type, payload }) {
    switch (type) {
        case ACTIONS.ADD_DIGIT:
            if (state.overwrite) {
                return {
                    ...state,
                    currentOperand: payload.digit,
                    overwrite: false,
                }
            }
            if (payload.digit == '0' && state.currentOperand == '0') return state
            if (payload.digit == '.' && state.currentOperand?.includes('.')) {
                return state
            }

            return {
                ...state,
                currentOperand: `${state.currentOperand || ''}${payload.digit}`,
            }

        case ACTIONS.CHOOSE_OPERATION:
            if (state.currentOperand == null && state.previusOperand == null) {
                return state
            }
            if (state.currentOperand == Number.POSITIVE_INFINITY) return state
            if (state.currentOperand == null) {
                return {
                    ...state,
                    operation: payload.operation,
                }
            }
            if (state.previusOperand == null) {
                return {
                    ...state,
                    operation: payload.operation,
                    previusOperand: state.currentOperand,
                    currentOperand: null,
                }
            }
            return {
                ...state,
                previusOperand: evaluate(state),
                operation: payload.operation,
                currentOperand: null,
            }

        case ACTIONS.EVALUATE:
            if (state.operation == null || state.currentOperand == null || state.previusOperand == null) {
                return state
            }

            return {
                ...state,
                overwrite: true,
                operation: null,
                previusOperand: null,
                currentOperand: evaluate(state),
            }

        case ACTIONS.DELETE_DIGIT:
            if (state.overwrite) {
                return {
                    ...state,
                    overwrite: false,
                    currentOperand: null,
                }
            }
            if (state.currentOperand == null) {
                return state
            }
            if (state.currentOperand.length === 1) {
                return {
                    ...state,
                    currentOperand: null,
                }
            }
            return {
                ...state,
                currentOperand: state.currentOperand.slice(0, -1),
            }

        case ACTIONS.CLEAR:
            return {}
    }
}

function evaluate({ currentOperand, previusOperand, operation }) {
    const prev = parseFloat(previusOperand)
    const current = parseFloat(currentOperand)

    if (isNaN(prev) || isNaN(current)) return ''

    let computation = ''

    switch (operation) {
        case '+':
            computation = prev + current
            break
        case '-':
            computation = prev - current
            break
        case '*':
            computation = prev * current
            break
        case '÷':
            computation = prev / current
            break
    }

    return computation.toString()
}

const INTERGET_FORMATTER = new Intl.NumberFormat('en-us', {
    maximumFractionDigits: 0,
})

function formatOperand(operand) {
    if (operand == null) return
    const [integer, decimal] = operand.split('.')
    if (decimal == null) return INTERGET_FORMATTER.format(integer)
    return `${INTERGET_FORMATTER.format(integer)}.${decimal}`
}

function App() {
    const [{ currentOperand, previusOperand, operation }, dispatch] = useReducer(reducer, {})

    function keyPress(e) {
        if (!isNaN(e.key) || e.key == '.') {
            let keyDigit = e.key
            return dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: keyDigit } })
        }
        if (e.key == '+' || e.key == '-' || e.key == '*' || e.key == '/') {
            let keyOperation = e.key
            return dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: keyOperation } })
        }
        if (e.key == 'Enter') {
            return dispatch({ type: ACTIONS.EVALUATE })
        }
        if (e.key == 'Backspace') {
            return dispatch({ type: ACTIONS.DELETE_DIGIT })
        }
        if (e.key == 'Delete' || e.key == 'Escape') {
            return dispatch({ type: ACTIONS.CLEAR })
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', keyPress)

        return () => {
            window.removeEventListener('keydown', keyPress)
        }
    }, [])

    return (
        <div className='calculator-grid'>
            <div className='output'>
                <div className='previus-operand'>
                    {formatOperand(previusOperand)} {operation}
                </div>
                <div className='current-operand'>{formatOperand(currentOperand)}</div>
            </div>
            <button className='span-two' onClick={() => dispatch({ type: ACTIONS.CLEAR })}>
                AC
            </button>
            <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>DEL</button>
            <OperationButton operation='÷' dispatch={dispatch} />
            <DigitButton digit='1' dispatch={dispatch} />
            <DigitButton digit='2' dispatch={dispatch} />
            <DigitButton digit='3' dispatch={dispatch} />
            <OperationButton operation='*' dispatch={dispatch} />
            <DigitButton digit='4' dispatch={dispatch} />
            <DigitButton digit='5' dispatch={dispatch} />
            <DigitButton digit='6' dispatch={dispatch} />
            <OperationButton operation='+' dispatch={dispatch} />
            <DigitButton digit='7' dispatch={dispatch} />
            <DigitButton digit='8' dispatch={dispatch} />
            <DigitButton digit='9' dispatch={dispatch} />
            <OperationButton operation='-' dispatch={dispatch} />
            <DigitButton digit='.' dispatch={dispatch} />
            <DigitButton digit='0' dispatch={dispatch} />
            <button onClick={() => dispatch({ type: ACTIONS.EVALUATE })} className='span-two'>
                =
            </button>
        </div>
    )
}

export default App
