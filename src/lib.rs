use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};

#[derive(BorshDeserialize, BorshSerialize, Debug)]
pub struct GreetingAccount {
    pub counter: u32,
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter(); //account can hold balance, token and data
    let account = next_account_info(accounts_iter)?;
    // let accoun2 = next_account_info(accounts_iter)?;

    msg!("start decode");

    let data_received = GreetingAccount::try_from_slice(instruction_data).map_err(|err| {
        msg!("err, {:?}", err);
        ProgramError::InvalidAccountData
    })?;

    msg!("greeting passed is: {:?}", data_received);

    if account.owner != program_id {
        msg!("Greeting account does not has the correct program id");
        return Err(ProgramError::IncorrectProgramId);
    };

    let mut greeting_account = GreetingAccount::try_from_slice(&account.data.borrow())?;
    greeting_account.counter += data_received.counter;
    greeting_account.serialize(&mut &mut account.data.borrow_mut()[..])?; //greeting_account's data will be adding to account.data

    msg!("Greeted: {}, times", greeting_account.counter);

    Ok(())
}
