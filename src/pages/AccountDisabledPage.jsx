import { Errors, Container } from "../components";

function AccountDisabledPage() {

  return (
    <Container>
      <Errors 
      status_code={401}
      title='Account Disabled'
      message='Your account has beed disabled by administrator.
        Please contact your administrator if you think this is a mistake.'/>
    </Container>
    
  )
}

export default AccountDisabledPage;
