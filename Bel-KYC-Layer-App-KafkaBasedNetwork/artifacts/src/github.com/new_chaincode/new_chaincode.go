package main


import (
    "fmt"
    "strconv"
    "errors"

    "github.com/hyperledger/fabric/core/chaincode/shim"
    pb "github.com/hyperledger/fabric/protos/peer"
)


type IdentityRecord struct {
    UniqueIdentityNumber     string        `json:"uniqueIdentityNumber"`    //docType is used to distinguish the various types of objects in state database
    Name                     string        `json:"name"` //the fieldtags are needed to keep case from bouncing around
    Gender                   string        `json:"gender"`
    DateOfBirth              string        `json:"dateOfBirth"`
    FathersName              string        `json:"fathersName"`
    Address                  string         `json:"address"`
    Mobile                   string         `json:"mobile"` 
    Email_id                 string         `json:"email_id"`
}

var logger = shim.NewLogger("example_cc0")

// SimpleChaincode example simple Chaincode implementation
type SimpleChaincode struct {
}

func (t *SimpleChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response  {
    logger.Info("########### example_cc0 Init ###########")

    _, args := stub.GetFunctionAndParameters()
    var A string    // Entities
    var Aval int // Asset holdings
    var err error

    // Initialize the chaincode
    A = args[0]
    Aval, err = strconv.Atoi(args[1])
    if err != nil {
        return shim.Error("Expecting integer value for asset holding")
    }
    logger.Info("Aval = %d, Bval = %d\n", Aval)

    // Write the state to the ledger
    err = stub.PutState(A, []byte(strconv.Itoa(Aval)))
    if err != nil {
        return shim.Error(err.Error())
    }
    return shim.Success(nil)
}

// Transaction makes payment of X units from A to B
func (t *SimpleChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
    logger.Info("########### example_cc0 Invoke ###########")

    function, args := stub.GetFunctionAndParameters()
    
    if function == "delete" {
        // Deletes an entity from its state
        return t.delete(stub, args)
    }

    if function == "query" {
        // queries an entity state
        return t.query(stub, args)
    }
    if function == "createRecord" {
        // Deletes an entity from its state
        return t.createRecord(stub, args)
    }

    logger.Errorf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", args[0])
    return shim.Error(fmt.Sprintf("Unknown action, check the first argument, must be one of 'delete', 'query', or 'move'. But got: %v", args[0]))
}

func (t *SimpleChaincode) createRecord(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    var err error
    fmt.Println("starting createrecord")
    

    if len(args) != 9 {
        return shim.Error("Incorrect number of arguments. Expecting 9")
    }

    uniqueIdentityNumber := args[0]
    name := args[1]
    gender := args[2]
    dateOfBirth := args[3]
    fathersName := args[4]
    address := args[5]
    mobile := args[6]
    email_id := args[7]

    //check if the uin already exists 
    // Get the state from the ledger
    Avalbytes, err := stub.GetState(uniqueIdentityNumber)
    if err != nil {
        return shim.Error("Failed to get state")
    }
    if Avalbytes != nil {
        fmt.Println("This UIN already exists - " + uniqueIdentityNumber)
        return shim.Error("This UIN already exists - " + uniqueIdentityNumber)
    }

    str := `{
        "uniqueIdentityNumber": "` + uniqueIdentityNumber + `", 
        "name": "` + name + `", 
        "gender": "` + gender + `", 
        "dateOfBirth": "` + dateOfBirth + `", 
        "fathersName": "` + fathersName + `", 
        "address": "` + address + `", 
        "mobile": "` + mobile + `", 
        "email_id": "` + email_id + `", 
    }`
    fmt.Println(str)
    err = stub.PutState(uniqueIdentityNumber, []byte(str)) //store marble with id as key
    if err != nil {
        return shim.Error(err.Error())
    }

    fmt.Println("- end create~record")
    return shim.Success(nil)
}

// Deletes an entity from state
func (t *SimpleChaincode) delete(stub shim.ChaincodeStubInterface, args []string) pb.Response {
    if len(args) != 1 {
        return shim.Error("Incorrect number of arguments. Expecting 1")
    }

    A := args[0]

    // Delete the key from the state in ledger
    err := stub.DelState(A)
    if err != nil {
        return shim.Error("Failed to delete state")
    }

    return shim.Success(nil)
}

// Query callback representing the query of a chaincode
func (t *SimpleChaincode) query(stub shim.ChaincodeStubInterface, args []string) pb.Response {

    var A string // Entities
    var err error

    if len(args) != 1 {
        return shim.Error("Incorrect number of arguments. Expecting uuid of the person to query")
    }

    A = args[0]

    // Get the state from the ledger
    Avalbytes, err := stub.GetState(A)
    if err != nil {
        jsonResp := "{\"Error\":\"Failed to get state for " + A + "\"}"
        return shim.Error(jsonResp)
    }

    if Avalbytes == nil {
        jsonResp := "{\"Error\":\"Nil amount for " + A + "\"}"
        return shim.Error(jsonResp)
    }

    jsonResp := "{\"Name\":\"" + A + "\",\"Amount\":\"" + string(Avalbytes) + "\"}"
    logger.Infof("Query Response:%s\n", jsonResp)
    return shim.Success(Avalbytes)
}

// ========================================================
// Input Sanitation - dumb input checking, look for empty strings
// ========================================================
func sanitize_arguments(strs []string) error {
    for i, val := range strs {
        if len(val) <= 0 {
            return errors.New("Argument " + strconv.Itoa(i) + " must be a non-empty string")
        }
        // if len(val) > 32 {
        //  return errors.New("Argument " + strconv.Itoa(i) + " must be <= 32 characters")
        // }
    }
    return nil
}

func main() {
    err := shim.Start(new(SimpleChaincode))
    if err != nil {
        logger.Errorf("Error starting Simple chaincode: %s", err)
    }
}