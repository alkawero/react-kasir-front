import React,{useState,useEffect} from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import EditIcon from '@material-ui/icons/Edit';
import TrendingDownIcon from '@material-ui/icons/Store';

import AddCircleIcon from '@material-ui/icons/AddCircle';

import RefreshIcon from '@material-ui/icons/Refresh';
import axios from 'axios'

import { useDebounce } from 'react-use';

import './App.css';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Typography, IconButton, Button } from '@material-ui/core';

const styles = {
  tableContent:{
    marginTop:5,
    padding:10
  },
  paper:{
    padding:10
  },
  paperAdd:{
    padding:10
  },
  textField:{
    marginTop:5
  },
  margins:{
    margin:5
  },
  noMargin:{
    margin:0
  },
  tittle:{    
    color:'white'
  },
  nameCell:{
    display:'flex',
    alignItems:'center',
    justifyContent:'flex-start'
  },
  icons:{
    color:"red"
  },
  selectReseller:{
    height:52,
    borderRadius:5,
    fontSize:25,
    backgroundColor:'#ff5e62',
    color:'white',
    border:'none'
  },
  selectRegular:{
    height:52,
    borderRadius:5,
    fontSize:25,
    
  }
 
}


function App(props) {
  const [name, setName] = useState('')
  const [id, setId] = useState(0)
  

  const [values, setValues] = React.useState({
    nameAdd: '',
    satuanAdd: '',
    priceAdd: '',
    nameEdit: '',
    satuanEdit: '',
    priceEdit: '',
  });

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value });
  };

  const formatNumber = (num)=> {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  const [data, setData] = useState([]);
  const [add, setAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [keranjang, setKeranjang] = useState([]);
  const [kranjangSubTotal, setKranjangSubTotal] = useState([]);
  const [total, setTotal] = useState(0);
  const [hoverOn, setHoverOn] = useState('');
  const [debouncedName, setDebouncedName] = React.useState('');
  const [reseller, setreseller] = useState('')
  
  
  useEffect(() => {
    
    const fetchData = async () => {
      if(debouncedName.trim()!==''){
        axios.post('http://localhost:8000/product/name', {
          name:debouncedName.trim(),
          reseller:reseller
        })
        .then(function (response) {
          setData(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });        
      }
            
    };

    setData([])
    fetchData();
    //console.log(data);
  }, [debouncedName]);
  
  
  useEffect(() => {
      //count total price
      let totalx = 0
      keranjang.forEach(product => {
        totalx = totalx+product.price
      });
      setTotal(totalx)
    
      //count total belanjaan
      const productNameSet = [...new Set(keranjang.map(product => product.name))]

      let finalKranjang=[]
      productNameSet.forEach(prod=>{
        let productCount=0
        let subTotal=0
        let satuan=''
        keranjang.forEach(prodInKranjang=>{
          if(prodInKranjang.name===prod){
            productCount++
            subTotal+=prodInKranjang.price
            satuan = prodInKranjang.satuan
          }          
        })
        finalKranjang.push({name:prod,count:productCount+' '+satuan,subTotal:subTotal})
      })
      setKranjangSubTotal(finalKranjang)      
    
  },[keranjang])


  

  useDebounce(
    () => {
      setDebouncedName(name);
    },
    300,
    [name]
  );

  const handleChangeSearch = (event)=>{    
    setName(event.target.value)
    //console.log(event.target.value+reseller)
    
  }

  const saveAdd = () =>{
    axios.post('http://localhost:8000/product', {
          name:values.nameAdd,
          satuan:values.satuanAdd,
          price:values.priceAdd
        }).then(()=>{
          setName(' ')
        })
    setAdd(false) 
           
  }

  const saveEdit = () =>{
    axios.patch('http://localhost:8000/product', {
          id:id,
          name:values.nameEdit,
          satuan:values.satuanEdit,
          price:values.priceEdit
        }).then(()=>{
          const names = name
          setName('')
          setName(names)
        })
    setEdit(false) 
           
  }

  const handleAddKeranjang = (product) =>{    
    const productNew = {...product,idNew:keranjang.length+1}    
    let krj = [...keranjang];
    krj.push(productNew)
    setKeranjang(krj)    
  }

  const handleEdit = (id)=>{
    setEdit(true)
    setId(id)
    axios.get('http://localhost:8000/product/'+id)
    .then(function (response) {      
      setValues({ 
        nameEdit: response.data.name,
        satuanEdit : response.data.satuan,
        priceEdit : response.data.price
       });      
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
  }

  const resellerOnChange = (e) =>{
      setreseller(e.target.value)    
  }
  const deleteItemOnKranjang = (name)=>{
    const newKeranjang = keranjang.filter(item=>(
          item.name !== name
    ))
    setKeranjang(newKeranjang)
  }

  const minItemOnKranjang = (name)=>{
    let newKeranjang = []
    keranjang.forEach(item=>{
          if(item.name === name){
            newKeranjang = keranjang.filter(prod=>(prod.idNew!==item.idNew))            
            return
          }          
        }
    )
    setKeranjang(newKeranjang)
  }
 
  const {classes} = props
  let tableRow = null
  let tableKeranjang = null

  if(data.length>0){
      tableRow = data.map(product=>(
                  <TableRow key={product.id} > 
                    <TableCell align="center" style={{whiteSpace:'nowrap'}}>
                      <IconButton size='small'>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <IconButton size='small' onClick={()=>handleEdit(product.id)}>
                        <EditIcon fontSize="small" />
                      </IconButton>                      
                    </TableCell>
                    <TableCell align="left"><div className={classes.nameCell}>{product.reseller && <TrendingDownIcon fontSize='small' color='secondary'style={{marginRight:'5px'}}/>}{product.name}</div></TableCell>
                    <TableCell align="left">{product.satuan}</TableCell>
                    <TableCell align="right" style={{whiteSpace:'nowrap'}}>
                    
                    {formatNumber(product.price)}
                    <IconButton size='medium' onClick={()=>handleAddKeranjang(product)}>
                        <AddCircleIcon fontSize="large" />
                      </IconButton>                    
                    </TableCell>
                    
                  </TableRow>
                ))
  }

  if(keranjang.length>0){
    tableKeranjang = kranjangSubTotal.map(product=>(
                <TableRow key={product.name} 
                  onMouseOver={()=>setHoverOn(product.name)}                  
                  >                   
                  <TableCell align="left" >
                      {product.name}
                  </TableCell>
                  <TableCell align="left"><div>{product.count}</div></TableCell>                  
                  <TableCell align="right" style={{whiteSpace:'nowrap'}}>
                      {product.name===hoverOn &&
                      <React.Fragment>
                      <Button color='secondary' size='small' onClick={()=>minItemOnKranjang(product.name)}>
                        -
                      </Button>
                      <IconButton color='secondary' size='small' onClick={()=>deleteItemOnKranjang(product.name)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      </React.Fragment>
                      ||
                      formatNumber(product.subTotal)
                      }</TableCell>                                 
                </TableRow>
              ))
}
  return (
    <Grid container direction='column' className='App' alignItems='center'>
      <Grid container justify='flex-start' spacing={16} alignItems='center'>
      <Grid item xs={3}>
        <Typography variant='h4'> 
        <span className={classes.tittle}>Kasir Abah Haji</span>
        </Typography>
      </Grid>        
        <Grid item xs={6}>
        <Paper className={classes.paper} elevation={12}>
          <TextField
            id="outlined-name"            
            className={classes.noMargin}
            value={name}
            onChange={handleChangeSearch}
            margin="normal"
            
            fullWidth
          />
          </Paper>                    
        </Grid>
        <select onChange={resellerOnChange} className={reseller=='1'?classes.selectReseller:classes.selectRegular}>
          <option value='0'>Regular</option>
          <option value='1'>Reseller</option>
        </select>
        <IconButton size='large' onClick={()=>setAdd(true)}>
            <AddIcon fontSize="large" nativeColor='white' />
        </IconButton>
        <IconButton size='large' onClick={()=>setKeranjang([])}>
            <RefreshIcon fontSize="large" nativeColor='white' />
        </IconButton>
      </Grid>
      <Grid container spacing={16} justify='center' className={classes.tableContent}>
      <Grid container justify='flex-end'>       
        <Grid item xs={5} container justify='flex-start'>          
              <Typography variant='h3'>
              <span style={{color:'white'}}>{'Rp. '+formatNumber(total)}</span>
              </Typography> 
        </Grid>
      </Grid>

        <Grid item xs={7}>
          <Paper className={classes.root} elevation={12}>
            <Table className={classes.table}>
              <TableHead>
                <TableRow>
                  <TableCell align="left">Action</TableCell>
                  <TableCell align="left">Nama</TableCell>
                  <TableCell align="left">Satuan</TableCell>
                  <TableCell align="center">Harga</TableCell>                
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRow}                  
              </TableBody>
            </Table>
          </Paper>
        </Grid> 

        <Grid item xs={5} >            
          <Paper className={classes.root} elevation={12}>
          <Grid container>
            <Table className={classes.table} >
              <TableHead onMouseOver={()=>setHoverOn('')}                  >
                <TableRow>
                  <TableCell align="left">Nama</TableCell>
                  <TableCell align="center">Jumlah</TableCell>                  
                  <TableCell align="right">Harga</TableCell>                
                </TableRow>
              </TableHead>
              <TableBody>
                {tableKeranjang}                  
              </TableBody>
            </Table>
            </Grid>
          </Paper>
        </Grid>      
        
      </Grid>
      {add &&
        <Grid item xs={6} className={classes.tableContent}>
        <Paper className={classes.paperAdd}elevation={12}>
          <Grid container justify='center' direction='column'>
            <TextField
              id="outlined-name"
              label="Nama Barang"
              className={classes.textField}
              value={values.nameAdd}
              onChange={handleChange('nameAdd')}
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <TextField
              id="outlined-name"
              label="Satuan"
              className={classes.textField}
              value={values.satuanAdd}
              onChange={handleChange('satuanAdd')}
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <TextField
              id="outlined-name"
              label="Harga"
              className={classes.textField}
              value={values.priceAdd}
              onChange={handleChange('priceAdd')}
              margin="normal"
              variant="outlined"
              fullWidth
            />
            <Grid container justify='flex-end' className={classes.margins}>
              <Button onClick={()=>setAdd(false)}> cancel </Button>
              <Button onClick={saveAdd} variant='contained' color='primary'> Save </Button>
            </Grid>
          </Grid>
        </Paper>
        </Grid>
      }

{edit &&
        <Grid item xs={6} className={classes.tableContent}>
        <Paper className={classes.paperAdd}>
          <Grid container justify='center' direction='column'>
            <TextField
              id="outlined-name"
              label="Nama Barang"
              className={classes.textField}
              value={values.nameEdit}
              onChange={handleChange('nameEdit')}
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <TextField
              id="outlined-name"
              label="Satuan"
              className={classes.textField}
              value={values.satuanEdit}
              onChange={handleChange('satuanEdit')}
              margin="normal"
              variant="outlined"
              fullWidth
            />

            <TextField
              id="outlined-name"
              label="Harga"
              className={classes.textField}
              value={values.priceEdit}
              onChange={handleChange('priceEdit')}
              margin="normal"
              variant="outlined"
              fullWidth
            />
            <Grid container justify='flex-end'>
              <Button onClick={()=>setEdit(false)}> cancel </Button>
              <Button onClick={saveEdit} variant='contained' color='primary'> Save </Button>
            </Grid>
          </Grid>
        </Paper>
        </Grid>
      }


    </Grid>
  );
}

export default withStyles(styles)(App);