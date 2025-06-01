const { useState, useEffect, useRef } = React;

function Calculator() {
  const [darkMode, setDarkMode] = useState(false);
  const [display, setDisplay] = useState('0');
  const [expressionDisplay, setExpressionDisplay] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [pendingOperator, setPendingOperator] = useState(null);
  const [pendingValue, setPendingValue] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [eraseAnimation, setEraseAnimation] = useState(false);
  const eraseButtonRef = useRef(null);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const calculate = (rightOperand, pendingOp) => {
    let newValue = parseFloat(rightOperand);
    
    if (pendingValue === null) {
      return newValue;
    }

    switch (pendingOp) {
      case '+':
        return pendingValue + newValue;
      case '-':
        return pendingValue - newValue;
      case '×':
        return pendingValue * newValue;
      case '÷':
        return pendingValue / newValue;
      default:
        return newValue;
    }
  };

  const handleNumberClick = (number) => {
    if (waitingForOperand) {
      setDisplay(number);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? number : display + number);
    }
  };

  const handleOperatorClick = (operator) => {
    const operand = parseFloat(display);
    
    if (pendingOperator !== null) {
      const result = calculate(operand, pendingOperator);
      setPendingValue(result);
      setLastResult(result);
      setDisplay(result.toString());
      setExpressionDisplay(expressionDisplay + ' ' + display + ' ' + operator);
    } else {
      setPendingValue(operand);
      setExpressionDisplay(display + ' ' + operator);
    }
    
    setPendingOperator(operator);
    setWaitingForOperand(true);
  };

  const handleEqualsClick = () => {
    if (pendingOperator === null) return;

    const operand = parseFloat(display);
    const result = calculate(operand, pendingOperator);
    
    const fullExpression = expressionDisplay + ' ' + display + ' = ' + formatNumber(result);
    setHistory([fullExpression, ...history]);
    
    setDisplay(result.toString());
    setExpressionDisplay('');
    setPendingOperator(null);
    setPendingValue(null);
    setLastResult(result);
    setWaitingForOperand(true);
  };

  const handleClearClick = () => {
    setDisplay('0');
    setExpressionDisplay('');
    setPendingOperator(null);
    setPendingValue(null);
    setWaitingForOperand(false);
  };

  const handleEraseClick = () => {
    if (waitingForOperand) return;
    
    setEraseAnimation(true);
    setTimeout(() => setEraseAnimation(false), 200);
    
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const handleDecimalClick = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleToggleSign = () => {
    const value = parseFloat(display) * -1;
    setDisplay(value.toString());
  };

  const handlePercentage = () => {
    const value = parseFloat(display) / 100;
    setDisplay(value.toString());
  };

  const handleHistoryItemClick = (item) => {
    const result = item.split(' = ')[1];
    setDisplay(result);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    
    if (Math.abs(num) >= 1e10) {
      return num.toExponential(6);
    }
    
    if (Number.isInteger(num)) {
      return num.toString();
    } else {
      const decimalStr = num.toString();
      if (decimalStr.includes('.') && decimalStr.split('.')[1].length > 8) {
        return num.toFixed(8).replace(/\.?0+$/, '');
      }
      return decimalStr;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-blue-50'}`}>
      <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="p-5 flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Calculator</h1>
          
          <div className="relative">
            <label className="toggle-switch">
              <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
              <span className="toggle-slider">
                <div className="absolute inset-0 flex items-center justify-between px-2">
                  <span className="text-xl text-yellow-400">??</span>
                  <span className="text-xl text-gray-100">?</span>
                </div>
              </span>
            </label>
          </div>
        </div>
        
        <div className={`px-5 py-6 text-right ${darkMode ? 'text-white' : 'text-gray-800'} border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="expression-display">{expressionDisplay}</div>
          <div className="main-display">{formatNumber(display)}</div>
        </div>
        
        <div className="p-5 grid grid-cols-4 gap-4">
          <button onClick={handleClearClick} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>C</button>
          <button 
            ref={eraseButtonRef}
            onClick={handleEraseClick} 
            className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${eraseAnimation ? 'erase-animation' : ''} ${darkMode ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-red-400 hover:bg-red-500 text-white'}`}
          >
            ?
          </button>
          <button onClick={handleToggleSign} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>+/-</button>
          <button onClick={() => handleOperatorClick('÷')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}>÷</button>
          
          <button onClick={() => handleNumberClick('7')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>7</button>
          <button onClick={() => handleNumberClick('8')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>8</button>
          <button onClick={() => handleNumberClick('9')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>9</button>
          <button onClick={() => handleOperatorClick('×')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}>×</button>
          
          <button onClick={() => handleNumberClick('4')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>4</button>
          <button onClick={() => handleNumberClick('5')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>5</button>
          <button onClick={() => handleNumberClick('6')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>6</button>
          <button onClick={() => handleOperatorClick('-')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}>-</button>
          
          <button onClick={() => handleNumberClick('1')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>1</button>
          <button onClick={() => handleNumberClick('2')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>2</button>
          <button onClick={() => handleNumberClick('3')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>3</button>
          <button onClick={() => handleOperatorClick('+')} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'}`}>+</button>
          
          <button onClick={() => handleNumberClick('0')} className={`calculator-btn col-span-2 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>0</button>
          <button onClick={handleDecimalClick} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}>.</button>
          <button onClick={handleEqualsClick} className={`calculator-btn col-span-1 p-5 rounded-xl font-bold ${darkMode ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}>=</button>
        </div>
        
        <div className="p-5 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <button 
              onClick={() => setShowHistory(!showHistory)} 
              className={`px-5 py-3 rounded-xl font-medium text-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
            {history.length > 0 && (
              <button 
                onClick={clearHistory} 
                className={`px-5 py-3 rounded-xl font-medium text-lg ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
              >
                Clear History
              </button>
            )}
          </div>
          
          {showHistory && (
            <div className={`mt-3 max-h-48 overflow-y-auto rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              {history.length === 0 ? (
                <p className="p-4 text-center text-lg text-gray-500">No history yet</p>
              ) : (
                <ul>
                  {history.map((item, index) => (
                    <li 
                      key={index} 
                      onClick={() => handleHistoryItemClick(item)}
                      className={`history-item p-4 text-lg cursor-pointer border-b ${index === 0 ? 'new-history-item' : ''} ${darkMode ? 'border-gray-600 hover:bg-gray-600' : 'border-gray-200 hover:bg-gray-200'} last:border-b-0 shadow-sm`}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
      <p className={`mt-4 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {new Date().getFullYear()}
      </p>
    </div>
  );
}

ReactDOM.render(<Calculator />, document.getElementById('root'));