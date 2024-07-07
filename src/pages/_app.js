import { useEffect, useState } from 'react';

import '@/styles/globals.css';
import styles from '@/styles/app.module.css';
import { NearContext } from '@/context';
import Head from 'next/head';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false

import { Wallet } from '@/wallets/near';
import { NetworkId, BlackDragonChestContract } from '@/config';

const wallet = new Wallet({ createAccessKeyFor: BlackDragonChestContract, networkId: NetworkId });

export default function MyApp({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState('');

  useEffect(() => { wallet.startUp(setSignedAccountId) }, []);

  return (
    
    <div className={styles.root}>
      <Head>
        <title>Black Dragon Chest Game</title>
        <meta name="description" content="Black Dragon Chest Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    
      <NearContext.Provider value={{ wallet, signedAccountId }}>
        <Component {...pageProps} />
      </NearContext.Provider>
    </div>
  );
}
