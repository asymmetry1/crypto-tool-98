import { useEffect, useState } from 'react';
import CryptoJS from 'crypto-js';
import './App.css';
import cryptoImage from './assets/crypto.gif';
import cryptoImage2 from './assets/crypto2.gif';
import PC98buttons from './components/pc98-buttons';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [key, setKey] = useState(''); 
  const [method, setMethod] = useState('base64'); // Default
  const [activeWindow, setActiveWindow] = useState('Media-Viewer.exe'); //Default
  const [notepadContetn, setNotepadContent] = useState('');
  const [aboutContent, setAboutContent] = useState('');
  const [aesHexOutput, setAesHexOutput] = useState({ ciphertext: '', iv: '', key: '' });
  const [isHelpOpen, setIsHelpOpen] = useState(false);

// Encode function
const handleEncode = () => {
  if (method === 'base64') {
    const encoded = btoa(inputText);
    setOutputText(encoded);
  } else if (method === 'aes') {
    if (!key) {
      setOutputText('Please enter a secret key for AES');
      return;
    }
    const encrypted = CryptoJS.AES.encrypt(inputText, key).toString();
    setOutputText(encrypted);
  } else if (method === 'hex') {
    const encoded = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(inputText));
    setOutputText(encoded);
  } else if (method === 'md5') {
    const hash = CryptoJS.MD5(inputText).toString();
    setOutputText(hash);
  } else if (method === 'sha256') {
    const textToHash = key ? '${inputText}${key}' : inputText; //optional salt
    const hash = CryptoJS.SHA256(textToHash).toString();
    setOutputText(hash);
  } else if (method === 'aes-hex') {
    if (!key) {
      setOutputText('Please enter a secret key for AES-Hex');
      return;
    }
    const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes = 128 bits
    const parsedKey = CryptoJS.enc.Utf8.parse(key); // Parse key as UTF-8
    const encrypted = CryptoJS.AES.encrypt(inputText, parsedKey, { iv });
    
    // Set clean HEX output
    setAesHexOutput({
      ciphertext: encrypted.ciphertext.toString(CryptoJS.enc.Hex),
      iv: iv.toString(CryptoJS.enc.Hex),
      key: parsedKey.toString(CryptoJS.enc.Utf8),
    });
    setOutputText(''); // Clear default output
  }
};

// Decode function
const handleDecode = () => {
  try {
    if (method === 'base64') {
      const decoded = atob(outputText);
      setOutputText(decoded);
    } else if (method === 'aes') {
      if (!key) {
        setOutputText('Please enter a secret key for AES');
        return;
      }
      const decrypted = CryptoJS.AES.decrypt(outputText, key).toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        setOutputText('Decryption failed - check your key or input');
      } else {
        setOutputText(decrypted);
      }
    } else if (method === 'hex') {
      const decoded = CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(outputText));
      setOutputText(decoded);
    } else if (method === 'sha256') {
      setOutputText("SHA-256 is a one-way hash - no decoding possible");
    } else if (method === 'md5') {
      setOutputText("MD5 is a one-way hash - no decoding possible ")
    } if (method === 'aes-hex') {
      if (!aesHexOutput.key || !aesHexOutput.ciphertext || !aesHexOutput.iv) {
        setOutputText('Please provide key, ciphertext, and IV for AES-Hex');
        return;
      }
      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: CryptoJS.enc.Hex.parse(aesHexOutput.ciphertext) },
        CryptoJS.enc.Hex.parse(aesHexOutput.key),
        { iv: CryptoJS.enc.Hex.parse(aesHexOutput.iv) }
      ).toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        setOutputText('Decryption failed - check your key, ciphertext, or IV');
      } else {
        setInputText(decrypted); // Still sets inputText for successful decryption
        setOutputText(''); // Clear any error messages
      }
    }
  } catch (error) {
    setOutputText('Invalid input for decoding');
  }
};

//Handle Change Window
const handleChangeWindow = (windowName) => {
  setActiveWindow(windowName);
}

//Error Handlers
const isErrorMessage = (text) =>
  text.startsWith('Please') ||
  text.startsWith('Invalid') ||
  text.startsWith('Decryption failed') ||
  text.startsWith('SHA-256') ||
  text.startsWith('MD5');

useEffect(() => {
    if (activeWindow === 'about.exe') {
      fetch('src/assets/about.txt')
        .then((response) => response.text())
        .then((text) => setAboutContent(text))
        .catch(() => setAboutContent('Error loading about.txt'));
    }
}, [activeWindow]);

return (
  <div className="App">
    <h1 className="app-title">✨暗号化ツール v0.1✨</h1>
    <div className="container">
      <div className="window form-window">
        <div className="window-title">
          <span>暗号ツール.bat - {method.toUpperCase()}</span>
          <PC98buttons/>
        </div>
        <div className="form-section">
          <div>
            <label>Select Method: </label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="base64">Base64</option>
              <option value="aes">AES</option>
              <option value="hex">Hex</option>
              <option value="sha256">SHA256</option>
              <option value="md5">MD5</option>
              <option value="aes-hex">AES-Hex</option>
            </select>
          </div>
          {(method === 'aes' || method === 'sha256' || method === 'aes-hex') && (
            <div>
              <label>
                {method === 'aes' ? 'Secret Key' : method === 'sha256' ? 'Optional Salt' : 'Secret Key'}:
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder={method === 'aes' ? 'Enter a secret key' : 'Enter an optional salt'}
              />
            </div>
          )}
          <div>
            <textarea
              placeholder="Enter text to encode/decode"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows="5"
              cols="50"
            />
          </div>
          <div>
            <button onClick={handleEncode}>Encode</button>
            <button onClick={handleDecode}>Decode</button>
          </div>
          <div>
            <h3>Result:</h3>
            {method === 'aes-hex' ? (
              <div className="aes-hex-output">
              <label>Ciphertext (Hex):</label>
              <textarea value={aesHexOutput.ciphertext} readOnly rows="2" cols="50" />
              <label>IV (Hex):</label>
              <textarea value={aesHexOutput.iv} readOnly rows="1" cols="50" />
              <label>Key (Utf8):</label>
              <textarea value={aesHexOutput.key} readOnly rows="1" cols="50" />
              </div>
              ) : (
              <textarea value={outputText} readOnly rows="5" cols="50" />
              )}
          </div>
        </div>
        {isErrorMessage(outputText) && (
          <div className="error-popup">
            <div className='window'>
              <div className='window-title'>Error 404</div>
              <p>{outputText}</p>
              <button onClick={() => setOutputText('')}>OK</button>
            </div>
          </div>
        )}
      </div>
      <div className="window image-window">
        <div className="window-title">
          <span onClick={() => handleChangeWindow("Media-Viewer.exe")} className='window-tab'>Media-Viewer.exe</span>
          <span onClick={() => handleChangeWindow("Notepad.exe")} className='window-tab'>Notepad.exe</span>
          <span onClick={() => handleChangeWindow("about.exe")} className='window-tab'>about.txt</span>
          <div className='pc98b-container'>
            <PC98buttons />
          </div>
        </div>
        {activeWindow === 'Media-Viewer.exe' && (
        <div className="image-section">
          <img src={cryptoImage} alt="Cryptography Animation" />
          <img src={cryptoImage2} alt="Second Cryptography Image" />
        </div>
        )}

        {activeWindow === 'Notepad.exe' && (
          <div className="notepad-section">
            <textarea 
            placeholder='Type anything here...'
            value={notepadContetn}
            onChange={(e) => setNotepadContent(e.target.value)} 
            />
          </div>
        )}

        {activeWindow === 'about.exe' && (
          <div className="notepad-section">
            <textarea 
            readOnly
            value={aboutContent}
            />
          </div>
        )}
      </div>
    </div>
  </div>
);
}

export default App;