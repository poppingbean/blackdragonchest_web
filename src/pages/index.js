import { useState, useEffect, useContext } from 'react';
import { NearContext } from '@/context';
import styles from '@/styles/app.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSignInAlt, faSignOutAlt, faTimes } from '@fortawesome/free-solid-svg-icons'
import { BlackDragonChestContract, BlackDragonTokenContract } from '../config';
import { format, differenceInSeconds } from 'date-fns';
import eventEmitter from '../components/eventEmitter';
import Notification from '../components/notification';
import '../styles/fonts.module.css';


// Contract that the app will interact with
const CONTRACT = BlackDragonChestContract;
const TOKENCONTRACT = BlackDragonTokenContract;

export default function BlackDragonChestNear() {
  const {signedAccountId, wallet } = useContext(NearContext);
  const [loggedIn, setLoggedIn] = useState(false);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [remainingSeconds, setCountDownTimer] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [onResponseString, setOnResponseString] = useState(null);
  const [accountRegistered, setAccountRegistered] = useState(null);
  const [notification, setNotification] = useState({ message: '', type: '' });
  
    const showNotification = (message, type) => {
      setNotification({ message, type });
  
      // Hide notification after 30 seconds
      setTimeout(() => {
        setNotification({ message: '', type: '' });
      }, 5000); // 5 seconds
    };

  useEffect(() => {
    // Danh sách các tên file hình nền
    const backgrounds = [
      'background_01.jpg',
      'background_02.jpg',
      'background_03.jpg',
      'background_04.jpg',
      'background_05.jpg',
    ];

    // Chọn ngẫu nhiên một phần tử từ mảng backgrounds
    const randomIndex = Math.floor(Math.random() * backgrounds.length);
    const randomBackground = backgrounds[randomIndex];

    // Cập nhật state để sử dụng hình nền đã chọn
    setBackgroundImage(`/img/${randomBackground}`);
  }, []);


  // Function để tính toán thời gian dạng nanoseconds
  function convertToNanoSeconds(timeInMilliseconds) {
    return timeInMilliseconds * 1000000; // Chuyển đổi milliseconds sang nanoseconds
  }
  
  // Hàm chuyển đổi từ nano giây thành chuỗi định dạng dd-MM-yyyy HH:mm:ss và tính toán thời gian đếm ngược
  function countdownTimerFromNanoSeconds(timeInNanoSeconds) {
    const totalSeconds = Math.floor(timeInNanoSeconds / 1_000_000_000);
    const milliseconds = (timeInNanoSeconds % 1_000_000_000) / 1_000_000; // Convert remaining nanoseconds to milliseconds

    // Tạo đối tượng Date từ số giây
    const dateObj = new Date(totalSeconds * 1000 + milliseconds);
    let tempSenconds = 0;
    // Tính toán thời gian còn lại từ hiện tại đến dateObj
    const now = new Date();
    if(dateObj > now){
      tempSenconds = differenceInSeconds(dateObj, now);
    }
    const remainingSeconds = tempSenconds;
    return remainingSeconds;
  }

  useEffect(() => {
    async function initBlackdragonChest(){
      if (!wallet) return;

    }
    initBlackdragonChest();
  }, [wallet]);


  useEffect(() => {
    setLoggedIn(!!signedAccountId);
  }, [signedAccountId]);


  const getPlayer = async (accountId) => {
    if(accountId !== null && accountId !== undefined && accountId !== "") { 
      const player = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_player', args: {'account_id': accountId }  });
      if(player === null || player === undefined){
        await handleCreatePlayer();
      }
      else {
        setPlayer(player);
      }
    }
  };
  
  useEffect(() => {
    if (signedAccountId) {
      getPlayer(signedAccountId);
    } else {
      resetPlayer();
    }
  }, [signedAccountId, getPlayer]);

  const resetPlayer = () => {
    setPlayer(null);
  };

  const checkRegisterdAccount = async () => {
    //check if account_id registered
    await wallet.viewMethod({ 
      contractId: TOKENCONTRACT, 
      method: 'storage_balance_of', args: {'account_id': signedAccountId }  }).then(result => setAccountRegistered(result));
    //If not, then register the account_id
    if(!accountRegistered || accountRegistered === '0' || accountRegistered <= 0){ 
      try{
        await wallet.callMethod({
          method: 'storage_deposit',
          args: {
            'account_id': signedAccountId,
            'registration_only': true
          },
          contractId: TOKENCONTRACT,
          deposit: '1250000000000000000000'
        })
      } catch (err) {
        const errorMessage = err.message || 'Error register account';
        setError(errorMessage);
        showNotification('Error when register account: ' + errorMessage, 'error');
      }
    }
  }
  
  const handleCreatePlayer = async () => {
    try {
      setLoading(true);
      await wallet.callMethod({ contractId: CONTRACT, method: 'create_player' });
      const updatedPlayer = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_player', args: {'account_id': signedAccountId }  });
      setPlayer(updatedPlayer);
    } catch (err) {
      const errorMessage = err.message || 'Error create new player';
      setError(errorMessage);
      showNotification('Error create new player: {0}' + errorMessage, 'error');
    } finally {
      await checkRegisterdAccount();
      setLoading(false);
    }
  };

  const handleClaimKey = async () => {
    try {
      setLoading(true);
      await wallet.callMethod({ contractId: CONTRACT, method: 'claim_key' });
      const updatedPlayer = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_player', args: {'account_id': signedAccountId }  });
      setPlayer(updatedPlayer);
      showNotification('Key claimed successfully!', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Error claiming key';
      setError(errorMessage);
      showNotification('Error claiming key: {0}' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChest = async () => {
    try {
      setLoading(true);
      const result = await wallet.callMethod({ contractId: CONTRACT, method: 'open_chest' });
      setOnResponseString(result);
      const updatedPlayer = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_player', args: {'account_id': signedAccountId }  });
      setPlayer(updatedPlayer);
      showNotification('Chest opened successfully!', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Error opening chest'
      setError(errorMessage);
      showNotification('Error opening chest: {0}' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExchangeChest = async () => {
    try {
      setLoading(true);
      await wallet.callMethod({ contractId: CONTRACT, method: 'exchange_chest' });
      const updatedPlayer = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_player', args: {'account_id': signedAccountId }  });
      setPlayer(updatedPlayer);
      showNotification('You just exchanged key/ resources to treasure!', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Error exchanging chest';
      setError(errorMessage);
      showNotification('Error exchanging chest: {0}' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSwapGift = async () => {
    try {
      setLoading(true);
      const currentPlayer = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_player', args: {'account_id': signedAccountId }  });
      await wallet.callMethod({ contractId: CONTRACT, method: 'swap_gift' });
      const updatedPlayer = await wallet.viewMethod({ contractId: CONTRACT, method: 'get_player', args: {'account_id': signedAccountId }  });
      setPlayer(updatedPlayer);

      let responseRewardString = comparePlayerState(currentPlayer, updatedPlayer);
      if(responseRewardString.length > 0){
        setOnResponseString(responseRewardString);
      }

      showNotification('You just opened a gift!', 'success');
    } catch (err) {
      const errorMessage = err.message || 'Error swapping gift';
      setError(errorMessage);
      showNotification('Error swapping gift: {0}' + errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const comparePlayerState = (currentPlayer, updatedPlayer) => {
    var diffKeys = updatedPlayer.keys - currentPlayer.keys;
    if(diffKeys >= 9) {
      return "Congrat!!!!! You just received " + diffKeys + " keys";
    }
    else {
      var diffTokens =  updatedPlayer.token_rewarded - currentPlayer.token_rewarded;
      if(diffTokens >= 0) {
        return "Congrat!!!!! You just received " + (updatedPlayer.last_token_rewarded/ 1_000_000_000_000_000_000_000_000) + "$Blackdragon tokens" ;
      }
      else return "";
    }
  }

  const handleCastleConstruct = () => {
    setOnResponseString('Castle building feature is under construction!');
  };
  
  const handlePvP = () => {
    setOnResponseString('PVP feature is under construction!');
  };

  const handleTogglePopup = () => {
    setShowPopup(!showPopup);
  };

  // Hàm chuyển đổi số giây thành chuỗi HH:mm:ss
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours}:${minutes}:${remainingSeconds}`;
  };

  useEffect(() => {
    // Example: Thiết lập giá trị ban đầu (ở dạng milliseconds)
    const initialNextKeyTime = player?.time_to_next_key_claimable || 0;
    const remainingSeconds = countdownTimerFromNanoSeconds(initialNextKeyTime);
    setCountDownTimer(remainingSeconds);
    const interval = setInterval(() => {
      const currentTime = Date.now();
      if (player && remainingSeconds > 0) {
        setCountDownTimer((remainingSeconds) => remainingSeconds - 1);
      } else {
        setCountDownTimer(0);
      }
    }, 1000);

    return () => {
      clearInterval(interval); // Xóa interval khi component unmount
    };
  }, [player]); // Đảm bảo useEffect chỉ chạy lại khi player thay đổi

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'F12') {
        //event.preventDefault();
      } else if ((event.ctrlKey && event.shiftKey && event.key === 'KeyI') || // Ctrl+Shift+I
      (event.ctrlKey && event.shiftKey && event.key === 'KeyJ') || // Ctrl+Shift+J
      (event.ctrlKey && event.key === 'KeyU') || // Ctrl+U
      (event.ctrlKey && event.shiftKey && event.key === 'KeyC')) {
        event.preventDefault();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
    if (typeof document !== 'undefined') {
      document.addEventListener('contextmenu', handleKeyDown);

      return () => {
        document.removeEventListener('contextmenu', handleKeyDown);
      };
    }
  }, []);

  useEffect(() => {
    const handleContextMenu = (event) => {
      event.preventDefault();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('contextmenu', handleContextMenu);

      return () => {
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, []);

  if (!wallet) {
    return <div>Loading NEAR Wallet...</div>;
  }

  return (
      <main className={styles.container}>
          {loading && (
            <div className={styles.overlay}>
              <img src="/img/loadingscreen.png" alt="Loading..." className={styles.spinner} />
            </div>
          )}
          {loggedIn ? (
            <div className={styles.screen} style={{ backgroundImage: `url(${backgroundImage})` }}>
              <div className={styles.user_info}>
                <img src="/img/dragon-head.png" alt="Player" className={styles.user_icon} onClick={handleTogglePopup} />
              </div>
              { remainingSeconds > 0 ? (
                <div className={styles.dragon_container}>
                <div className={styles.dragon_shadow}>
                </div>
                  <img src="/img/blackdragon_sleep_02.png" alt="Dragon" className={styles.dragon} />
                  <img src="/img/cloud_blackdragon.png" alt="Dragon" className={styles.cloud} />
                  <div className={styles.centeredContent}>
                    {
                      remainingSeconds > 0 ? (
                          <div className={styles.time_remaining}>{formatTime(remainingSeconds)}</div>
                        ) : (
                          <button className={styles.claim_button} onClick={handleClaimKey} disabled={loading}>
                            Claim Key
                          </button>
                        )
                    }
                  </div>
                </div>
              ) : (
                <div className={styles.dragon_container}>
                <div className={styles.dragon_shadow}>
                </div>
                  <img src="/img/blackdragon_sleep_01.png" alt="Dragon" className={styles.dragon} />
                  <img src="/img/cloud_blackdragon.png" alt="Dragon" className={styles.cloud} />
                  <div className={styles.centeredContent}>
                    {
                      remainingSeconds > 0 ? (
                          <div className={styles.time_remaining}>{formatTime(remainingSeconds)}</div>
                        ) : (
                          <button className={styles.claim_button} onClick={handleClaimKey} disabled={loading}>
                            Claim Key
                          </button>
                        )
                    }
                  </div>
                </div>
              )}
              {player && (
                <div className={styles.resources}>
                  {/* Hiển thị nguyên liệu và số lượng */}
                  <div className={styles.resource}>
                    <div className={styles.resource_icon}>
                      <img src="/img/stone.png" className={styles.resource_icon} alt="Stone" />
                      <span className={styles.resource_amount}>{player.stone}</span>
                    </div>
                  </div>
                  <div className={styles.resource}>
                    <div className={styles.resource_icon}>
                      <img src="/img/iron.png" className={styles.resource_icon} alt="Iron" />
                      <span className={styles.resource_amount}>{player.iron}</span>
                    </div>
                  </div>
                  <div className={styles.resource}>
                    <div className={styles.resource_icon}>
                      <img src="/img/wood.png" className={styles.resource_icon} alt="Wood" />
                      <span className={styles.resource_amount}>{player.wood}</span>
                    </div>
                  </div>
                </div>
              )}
              {player && (
                <div className={styles.features}>
                  <button className={styles.featureButton} onClick={() => handleCastleConstruct()}>
                    <img src="/img/castle_construct.png" alt="Castle Construct" className={styles.featureImage} />
                  </button>
                  <button className={styles.featureButton} onClick={() => handlePvP()}>
                    <img src="/img/pvp.png" alt="PvP" className={styles.featureImage} />
                  </button>
                </div>
              )}
              {player && (
              <div className={styles.items}>
                <div className={styles.item}>
                  <div className={styles.item_icon} onClick={handleExchangeChest}>
                    <img src="/img/keys.png" alt="Key" className={styles.item_icon} disabled={loading} />
                    <span className={styles.item_amount}>{player.keys}</span>
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.item_icon} onClick={handleOpenChest} disabled={loading}>
                    <img src="/img/chests.png" alt="Chests" className={styles.item_icon} />
                    <span className={styles.item_amount}>{player.chests}</span>
                  </div>
                </div>
                <div className={styles.item}>
                  <div className={styles.item_icon} onClick={handleSwapGift} disabled={loading}>
                    <img src="/img/gift_box.png" alt="Gift" className={styles.item_icon} />
                    <span className={styles.item_amount}>{player.gift}</span>
                  </div>
                </div>
              </div>
              )}
              <Notification message={notification.message} type={notification.type} />
            </div>
          ) : (
            <div className={styles.screen} style={{ backgroundImage: `url(${backgroundImage})` }}>
              <div className={styles.user_info}>
                  <button className={styles.login_button} onClick={() => wallet.signIn()} disabled={loading}>
                   <FontAwesomeIcon icon={faSignInAlt} className={styles.login_button_icon}/> Log in 
                </button>
              </div>
            </div>
          )}
          {onResponseString && (
            <div className={styles.popup}>
              <div className={styles.popup_content}>
                <span>{onResponseString}</span>
              </div>
              <button className={styles.close_button} onClick={() => setOnResponseString(null)}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
          )}
          
          {showPopup && (
            <div className={styles.popup}>
              <div className={styles.popup_content}>
                <span className={styles.user_name}>{signedAccountId}</span>
                <button className={styles.login_button} onClick={() => wallet.signOut()} disabled={loading}>
                  <FontAwesomeIcon icon={faSignOutAlt} size="2x" />
                </button>
              </div>
              
              <button className={styles.close_button} onClick={handleTogglePopup}><FontAwesomeIcon icon={faTimes} /></button>
            </div>
          )}
      </main>
  );
};