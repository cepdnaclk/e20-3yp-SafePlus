import './App.css';
import Header from './components/Header/Header';
import { Grid, GridItem } from '@chakra-ui/react';

function App() {
  return (
    <Grid
      templateAreas={`"header"
                      "main"`}
      gridTemplateRows={'auto 1fr'} 
      gridTemplateColumns={'100%'} 
      h="100vh" 
      gap="1"
      color="blackAlpha.700"
      fontWeight="bold"
    >
      <GridItem bg="orange.300" area={'header'}>
        <Header />
      </GridItem>

      <GridItem pl="2" bg="green.300" area={'main'}>
        Main
      </GridItem>
    </Grid>
  );
}

export default App;
