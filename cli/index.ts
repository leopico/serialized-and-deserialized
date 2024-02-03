//2a2dtPAwWCY6TLfa9KkM14u9upa2mE5i6RmB6Tvtrf9D
import * as borsh from 'borsh';
import * as web3 from "@solana/web3.js";
import * as BufferLayout from "@solana/buffer-layout";
import { Buffer } from "buffer";
/**
 * The public key of the account we are saying hello to
 */
let greetedPubkey: web3.PublicKey;
/**
* The state of a greeting account managed by the hello world program
*/
class GreetingAccount {
    counter = 0;
    constructor(fields: { counter: number } | undefined = undefined) {
        if (fields) {
            this.counter = fields.counter;
        }
    }
}

/**
* Borsh schema definition for greeting accounts
*/
const GreetingSchema = new Map([
    [GreetingAccount, { kind: 'struct', fields: [['counter', 'u32']] }],
]);

/**
 * The expected size of each greeting account.
 */
const GREETING_SIZE = borsh.serialize(
    GreetingSchema,
    new GreetingAccount(),
).length;

const connection = new web3.Connection(web3.clusterApiUrl("devnet"));

async function main() {
    const key: Uint8Array = Uint8Array.from([199, 143, 96, 141, 51, 21, 9, 2, 144, 54, 34, 10, 241, 213, 24, 79, 238, 30, 122, 124, 90, 46, 22, 22, 149, 77, 59, 158, 175, 240, 102, 133, 75, 182, 27, 58, 138, 244, 236, 239, 196, 16, 190, 96, 53, 129, 215, 74, 11, 141, 83, 36, 158, 103, 87, 172, 0, 147, 8, 94, 223, 67, 233, 111]);

    //NO
    const layout = BufferLayout.struct([BufferLayout.u32("counter")])
    let data: Buffer = Buffer.alloc(layout.span);
    layout.encode({ counter: 2 }, data);
    console.log(`data is : ${Buffer.from(data)}`);


    const signer: web3.Keypair = web3.Keypair.fromSecretKey(key);
    let programId: web3.PublicKey = new web3.PublicKey("2a2dtPAwWCY6TLfa9KkM14u9upa2mE5i6RmB6Tvtrf9D");

    // Derive the address (public key) of a greeting account from the program so that it's easy to find later.

    //first create account with seed then refer with Public Key
    // const GREETING_SEED = 'hello 32';
    // greetedPubkey = await web3.PublicKey.createWithSeed(
    //     signer.publicKey,
    //     GREETING_SEED,
    //     programId,
    // );

    greetedPubkey = new web3.PublicKey("HkH1GWubaDnxnqkLf1feGWJ3VnDiLzZCGt1mdAn7JvfG");

    // let fees = 0;

    // const lamports = await connection.getMinimumBalanceForRentExemption(
    //     GREETING_SIZE,
    // );

    //This creteAccount with Seed  only first time    
    const transaction = new web3.Transaction()

    // .add(
    //     web3.SystemProgram.createAccountWithSeed({
    //         fromPubkey: signer.publicKey,
    //         basePubkey: signer.publicKey,
    //         seed: GREETING_SEED,
    //         newAccountPubkey: greetedPubkey,
    //         lamports,
    //         space: GREETING_SIZE,
    //         programId,
    //     }),
    // );

    transaction.add(
        new web3.TransactionInstruction({
            keys: [
                { pubkey: greetedPubkey, isSigner: false, isWritable: true }],
            programId,
            data: data
        })
    );

    await web3
        .sendAndConfirmTransaction(connection, transaction, [signer])
        .then((sig) => {
            console.log("sig: {}", sig);
        });

    reportGreetings();
}

async function reportGreetings(): Promise<void> {
    const accountInfo = await connection.getAccountInfo(greetedPubkey);
    if (accountInfo === null) {
        throw 'Error: cannot find the greeted account';
    }
    const greeting = borsh.deserialize(
        GreetingSchema,
        GreetingAccount,
        accountInfo.data,
    );
    console.log(
        greetedPubkey.toBase58(),
        'has been greeted',
        Number(greeting.counter),
        'time(s)',
    );
}

main();