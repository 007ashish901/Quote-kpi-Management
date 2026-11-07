import { LightningElement , api } from 'lwc';
import getName from '@salesforce/apex/getProductName.name'
import getProductDetails from '@salesforce/apex/getProductFields.getProductDetails'
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { getRelatedListRecords } from "lightning/uiRelatedListApi";
export default class QuoteLineEditer extends LightningElement {
    lines = []
    allNamesProduct
    showProducts 
    displayTotalNetPrice
     
    displayTotalUnitPrice
    displayTotal
    displayTotalNetDiscount
    locklwc = false

     get lineCount() {
    return 'Total Product: ' + this.lines.length;
}
     handleClick(){
        this.showProducts = true
     }
   
    handleSearch(event){
          console.log("entered in sarch")
        this.showProducts = true
          const serc = event.target.value
          if(serc.length != 0){
            
              console.log(this.showlist)
           getName({
               proName : event.target.value
               
           })
           .then(result => {
              this.allNamesProduct = result
               console.log("entered in result" + result)
           })
           .catch(error => {
               console.log('error from handleSearch' + error)
           })}
        else{
             console.log("entered in sarch size is 0")
           
           
        }   
    }


    handleSelect(event){
        console.log("selected");
       this.showProducts = false
         const selectedProduct = event.currentTarget.dataset.id;
         console.log(selectedProduct);
         getProductDetails({
                
               id : selectedProduct
               
           })
           .then(result => {
            console.log("result from apex for product :",result)
             // const product = result.product;
           // const entry = result.entry;

            const newLine = {
                productId: result.Id,
                name: result.Name,
                unitPrice: result.PricebookEntries[0].UnitPrice,
                costPrice:  0,
                qty: 1,
                discount: 0,
                tier: 'Vol Tier 0',
                discountPerProduct : 0,
                totalDiscount :0 ,
                netTotal:  0,
                rowNum: this.lines.length + 1
            };

            this.lines = [...this.lines, newLine];

            console.log('Lines:', JSON.stringify(this.lines, null, 2));
                
           })
           .catch(error => {
                 console.error('Error from select product:', JSON.stringify(error));
           })}


    handleDelete(event){
        console.log(event.currentTarget.dataset.id);
        this.lines = this.lines.filter(line => line.productId !== event.currentTarget.dataset.id ).map((line, index) => ({
            ...line,
            rowNum: index + 1
        }))
    }


   
handleQtyChange(event) {
    const currentID = event.currentTarget.dataset.id;
    const field = event.currentTarget.dataset.field;
    let value = Number(event.target.value);

    if (field === 'qty' && value < 0) {
        value = 0;
        event.target.value = 0;

        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error!',
                message: 'Quantity cannot be negative.',
                variant: 'error'
            })
        );
    }

    this.lines = this.lines.map(line => {
        if (line.productId !== currentID) {
            return line;
        }

        const updatedLine = { ...line };
        updatedLine[field] = value;

        if (field === 'qty') {
            if (value >= 50) {
                updatedLine.tier = 'Vol Tier 2';
            } else if (value >= 10) {
                updatedLine.tier = 'Vol Tier 1';
            } else {
                updatedLine.discount = 0;
                updatedLine.tier = 'Vol Tier 0';
            }
        }
     

         return this.calculateLine(updatedLine);
    });
}


    handleDisChange(event) {
    const currentID = event.currentTarget.dataset.id;
    const field = event.currentTarget.dataset.field;
    const value = Number(event.target.value);

    this.lines = this.lines.map(line => {
        if (line.productId === currentID) {

            const qty = Number(line.qty);

            let maxDiscount = 0;

            if (qty >= 50) {
                maxDiscount = 12;
            } else if (qty >= 10) {
                maxDiscount = 5;
            }

            if (qty < 10) {
                line.discount = 0;
                event.target.value = 0;
                this.dispatchEvent(
        new ShowToastEvent({
            title: 'Discount Not Allowed',
            message: 'For quantity less than 10, the discount is 0%.',
            variant: 'warning'
        })
    );

            } else if (field === 'discount') {

                if (value > maxDiscount || value < 0) {

                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error!',
                            message: `For quantity ${qty}, discount cannot exceed ${maxDiscount}%.`,
                            variant: 'error'
                        })
                    );

                    event.target.value = line.discount;

                } else {
                    line.discount = value;
                }
            }

                 
        }

        return this.calculateLine(line);
    });
}


calculateLine(line) {
    const qty = Number(line.qty) || 0;
    const unitPrice = Number(line.unitPrice) || 0;
    const discount = Number(line.discount) || 0;

    const discountPerProduct = unitPrice * (discount / 100);
    const costPrice = unitPrice - discountPerProduct;
    const totalDiscount = discountPerProduct * qty;
    const netTotal =   costPrice * qty 

    return {
        ...line,
        costPrice,
        discountPerProduct,
        totalDiscount,
        netTotal
    };
}


handleRecalculate(){
    console.log("clicked handle changed")
    this.displayTotalUnitPrice = this.lines.reduce((sum, line) => {
    return sum +   line.unitPrice;
}, 0);


     this.displayTotalCostPrice = this.lines.reduce((sum, line) => {
    return sum +   line.costPrice;
}, 0); 


     this.displayTotalNetPrice = this.lines.reduce((sum, line)=>{
        return sum +  line.netTotal;
     },0);

const sumOfDiscount = this.lines.reduce(
    (sum, line) => sum + line.netDiscount,
    0
);


const tier0Count =  this.lines.reduce(
    (sum , line) =>{ if(line.tier === 'Vol Tier 0'){
      return  sum + Number(line.qty)
    }
    else
    
     return   sum;
},
0);

const tier1Count =  this.lines.reduce(
    (sum , line) =>{ if(line.tier === 'Vol Tier 1'){
      return  sum + Number(line.qty)
    }
    else
    
     return   sum;
},
0);

const tier2Count =  this.lines.reduce(
    (sum , line) =>{ if(line.tier === 'Vol Tier 2'){
      return  sum + Number(line.qty)
    }
    else
    
     return   sum;
},
0);
      
     const discount = ((this.displayTotalUnitPrice - this.displayTotalCostPrice) / this.displayTotalUnitPrice)  * 100


  this.displayTotalNetDiscount =this.lines.reduce((sum, line)=>{
        return sum +  line.totalDiscount;
     },0);
  
  


       console.log(  this.displayTotalUnitPrice);
    console.log('Total Cost Price:', this.displayTotalCostPrice);
    console.log(   sumOfDiscount);
    console.log(  this.displayTotalNetDiscount);
    console.log("tier 0",tier0Count);
     const event = new CustomEvent('recalculate', {
    detail: {
        totalUnitPrice: this.displayTotalUnitPrice,
        totalCostPrice: this.displayTotalCostPrice,
        totalNetDiscount: this.displayTotalNetDiscount,
        totalNetPrice : this.displayTotalNetPrice,
        discount : discount,
        tier0Count : tier0Count,
        tier1Count : tier1Count,
        tier2Count : tier2Count,

    }
}, 0);

this.dispatchEvent(event);

}


    @api
    clearWorkspace() {
    console.log('clearWorkspace called in child');

    this.lines = [];
    this.allNamesProduct = [];
    this.showProducts = false;
    this.displayTotalNetPrice
    this.displayTotalUnitPrice = 0;
    this.displayTotalCostPrice = 0;
    this.displayTotalNetDiscount = 0;
}

handleSubmit(){
    this.locklwc = true
        const event = new CustomEvent('submit'  , {
    detail: {
        list   : this.lines
    }
});
this.dispatchEvent(event);

}

}

     