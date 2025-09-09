import { Errors, Container } from "../components";

function NotFoundPage() {
  return (
    <Container>
      <Errors 
      status_code={404}
      title='Page Not Found'
      message='Sorry, we couldn’t find the page you’re looking for.
        Kindly check the URL'/>
    </Container>
    
  );
}

export default NotFoundPage;
