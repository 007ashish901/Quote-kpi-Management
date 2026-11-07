import { LightningElement , api , wire} from 'lwc';
import postQuotesAndQuoteLineItem from '@salesforce/apex/QuoteController.postQuotesAndQuoteLineItem';
import { NavigationMixin } from 'lightning/navigation';
import { getRecord  } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
export default class QuoteHeaderBar extends NavigationMixin(LightningElement) {
    quoteID
    quoteName;
    showFlow = false; 
    totalUnitPrice = 0;
     discount = 0;
     totalCostPrice = 0;
    totalNetDiscount = 0;
    opportunityId;
     opportunityName;
    list 
    //isLocked = false;
    totalNetPrice =0
    tier0Count = 0
     tier1Count = 0
     tier2Count =  0
     _recordId;

    @api
    get recordId() {
        return this._recordId;
    }
    
    set recordId(value) {
        this._recordId = value;

        if (value) {
            this.opportunityId = value;
            console.log('Opportunity Record ID:', value);
        }
    }

     
    get showRecordPicker() {
        return !this._recordId;
    }


     handleOpportunityChange(event) {
    this.opportunityId = event.detail.recordId;
    this.opportunityName = undefined;
}

@wire(getRecord, {
    recordId: '$opportunityId',
    fields: ['Opportunity.Name']
})
opportunity({data , error}){
    if(data){
        this.opportunityName = data.fields.Name.value;
    }else if(error){
        this.opportunityName = undefined;
    }
}


handleOpenOpportunity() {
    if (!this.opportunityId) {
        return;
    }
     console.log("button clicked")
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.opportunityId,
            objectApiName: 'Opportunity',
            actionName: 'view'
        }
    });
}



    handleSubmit(event){
        console.log(this.opportunityId)
        console.log(typeof( this.opportunityId))
       this.list = event.detail.list
       console.log(
        'Quote list:',
        JSON.stringify(this.list)
    );
       postQuotesAndQuoteLineItem({

          displayTotalCost : this.totalCostPrice,
          displayTotal : this.totalUnitPrice,
          totalNetDiscount : this.totalNetDiscount,
          totalNetPrice : this.totalNetPrice,
          discount : this.discount,
          quoteList : this.list,
          opportunityId: this.opportunityId
          

       }).then((result) => {
                this.quoteID = result.quoteID;
                this.quoteName = result.quoteName;
                console.log('submited quote id',this.quoteID);
                console.log('submited quote id',this.quoteName);
               // this.isLocked = true;         
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',   message: `Quote ${this.quoteName} submitted successfully.`, variant: 'success'
                }));
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body ? error.body.message : 'record not saved',
                    variant: 'error'
                }));
    
            
            })
    }


     handleSubmitForApproval() {


       if (Number(this.discount) < 5) {
    this.dispatchEvent(new ShowToastEvent({
        title: 'Warning',
        message: 'Discount must be at least 5% to submit for approval.',
        variant: 'warning'
    }));

    return;
}

    console.log('Quote ID:', this.quoteID);

    if (!this.quoteID) {
        console.error('Quote ID is missing');
        this.dispatchEvent(new ShowToastEvent({
        title: 'Warning',
        message: 'Submit The Product Records.',
        variant: 'warning'
    }));
        return;
    }

    const flow = this.template.querySelector('lightning-flow');

    console.log('Flow component:', flow);

    if (!flow) {
        console.error('Lightning Flow component not found');
        return;
    }

    const inputVariables = [
        {
            name: 'recordId',
            type: 'String',
            value: this.quoteID
        }
    ];

     

    flow.startFlow('ApprovalProcessFlow', inputVariables);
}


handleFlowStatusChange(event) {
    console.log('Flow Status:', event.detail.status);

    if (event.detail.status === 'FINISHED_SCREEN') {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Quote submitted for approval successfully!',
                variant: 'success'
            })
        );

        this.showFlow = false;
    }

    else if (event.detail.status === 'ERROR') {
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Error',
                message: 'Something went wrong while submitting the Quote for approval.',
                variant: 'error'
            })
        );

        this.showFlow = false;
    }
}

 

    handleRecalculate(event) {
        this.totalUnitPrice = event.detail.totalUnitPrice;
        this. totalCostPrice     = event.detail.totalCostPrice;
        const temp     = event.detail.totalNetDiscount;
        this.totalNetDiscount =  Number(temp).toFixed(2)  
        const temp2  = event.detail.discount;
        this.discount =   Number(temp2).toFixed(2); 
        const temp3 = event.detail.totalNetPrice;
        this.totalNetPrice = Number(temp3).toFixed(2);
        this.tier0Count = event.detail.tier0Count;
        this.tier1Count = event.detail.tier1Count;
        
        this.tier2Count = event.detail.tier2Count;


   
           
    }



    
handleDiscard() {
    this.totalUnitPrice = 0;
    this.totalCostPrice = 0;
    this.totalNetDiscount = 0;
    this.discount = 0;
    this.totalNetPrice = 0;
    if(!this._recordId){
        this.opportunityName = undefined;
    }
    this.tier0Count = 0;
    this.tier1Count = 0;
    this.tier2Count = 0;
    this.opportunityId = null
    const child = this.template.querySelector('c-quote-line-editer');

    console.log('Child component found:', child);

    if (child) {
        child.clearWorkspace();
    } else {
        console.error('Child not found. Verify the child tag in quoteHeaderBar.html.');
    }
}



}