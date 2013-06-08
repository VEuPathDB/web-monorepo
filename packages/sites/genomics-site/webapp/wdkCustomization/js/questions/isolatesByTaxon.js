
$(function() {
    addStrainCountCheck();
})

function addStrainCountCheck() {
    var MAX_SELECTED = 900;
    $('#form_question').submit(function(){
        var checkedCount = 0;
        $('div[id^=strain] input').each(function(){
            checkedCount += this.checked ? 1 : 0;
        });
        if (checkedCount > MAX_SELECTED) {
            alert('We\'re sorry.  You cannot currently choose more than '+MAX_SELECTED+' strains in one step.\n\n'+
                    'You have selected '+checkedCount+'.  Please reduce the number and try again.\n\n'+
                    'Note: If you absolutely need >'+MAX_SELECTED+' strains, add another step to your strategy, choose "Isolates By Taxon/Strain" again,\n'+
                    '           select additional strains, and union the results.');
            return false;
        }
        return true;
    });
}
