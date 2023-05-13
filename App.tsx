import './global';
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Web3 from 'web3';

const web3 = new Web3(
  'wss://sepolia.infura.io/ws/v3/9a1a8380962c49b7a546e25c3950a8be',
);

const privateKey =
  'de83867e5a9eb8a509e5d1c2b6119c9869748a0b5f66fa28dc40a959ffc257c8';
const account = web3.eth.accounts.privateKeyToAccount(privateKey);

enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  DEFAULT = '',
}
function App() {
  const [amount, onChangeAmount] = React.useState('0.001');
  const [recipient, onChangeRecipient] = React.useState(
    '0xcdBef3B539593839D022Ab102B97D23F127C2417',
  );
  const [txnHash, setTxnHash] = useState('');
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const [transactionStatus, settransactionStatus] = useState(
    TransactionStatus.DEFAULT,
  );

  const [transactionStatusLoading, setTransactionStatusLoading] =
    useState(false);

  const getTransactionStatus = async (txn: string) => {
    setTransactionStatusLoading(true);

    try {
      const receipt = await web3.eth.getTransactionReceipt(txn);
      if (receipt == null) {
        settransactionStatus(TransactionStatus.PENDING);
      } else {
        settransactionStatus(
          receipt.status ? TransactionStatus.SUCCESS : TransactionStatus.FAILED,
        );
      }
    } catch (error) {
      settransactionStatus(TransactionStatus.FAILED);
      console.log('error2', error);
    } finally {
      setTransactionStatusLoading(false);
    }
  };

  const onTransaction = async () => {
    setTxnHash('');
    setIsTransactionLoading(true);
    settransactionStatus(TransactionStatus.DEFAULT);

    const value = web3.utils.toWei(amount, 'ether'); // Replace with amount to send
    try {
      const txCount = await web3.eth.getTransactionCount(account.address);
      const signedTx = await account.signTransaction({
        nonce: web3.utils.toHex(txCount) as unknown as number,
        to: recipient,
        value: web3.utils.toHex(value),
        // @ts-ignore
        gasLimit: web3.utils.toHex(21000),
        gasPrice: web3.utils.toHex(web3.utils.toWei('0.01', 'gwei')),
      });
      if (signedTx.rawTransaction === undefined) {
        console.log('signedTx', signedTx);
        return;
      }
      const txHash = await web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
      );
      setTxnHash(txHash.transactionHash);
      getTransactionStatus(txHash.transactionHash);
    } catch (error) {
      console.log('error', error);
      settransactionStatus(TransactionStatus.FAILED);
      return;
    } finally {
      setIsTransactionLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text>Address</Text>
      <TextInput
        onChangeText={onChangeRecipient}
        value={recipient}
        placeholder="Type here..."
      />
      <Text>Transaction Amount</Text>
      <TextInput
        onChangeText={onChangeAmount}
        value={amount}
        placeholder="Type here..."
        keyboardType="numeric"
      />
      <View style={styles.button}>
        <Button title="Make Transaction" onPress={onTransaction} />
      </View>
      {isTransactionLoading ? <ActivityIndicator /> : null}
      <Text style={{marginTop: 20}}>Transaction Hash: {txnHash}</Text>
      {transactionStatusLoading ? <ActivityIndicator /> : null}
      <Text>Transaction Status: {transactionStatus}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 20,
  },
  button: {
    alignSelf: 'flex-end',
    marginEnd: 40,
  },
});

export default App;

// const getBalance = async () => {
//   const bal = await web3.eth.getBalance(
//     '0x314Af59bB46fD913795FbdAd1EC90C4571Fb07Fb',
//   );
//   const ether = web3.utils.fromWei(bal, 'ether');
//   console.log('bal', bal, ether);
// };
