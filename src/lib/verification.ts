export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();
    
    if (!data || error) return false;
    
    // Mark as used
    await supabase
      .from('email_verifications')
      .update({ used: true })
      .eq('id', data.id);
    
    return true;
  }