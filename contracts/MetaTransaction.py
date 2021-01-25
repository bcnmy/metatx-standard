import smartpy as sp

# Type aliases
blake2b_hash = sp.TBytes
permitKey = sp.TRecord(address=sp.TAddress, param_hash=blake2b_hash)


class MetaTransaction(sp.Contract):
    def __init__(self, baseContract):
        self.baseContract = baseContract
        self.init(
            permits=sp.big_map(tkey=permitKey, tvalue=sp.TBool),
            user_store=sp.big_map(tkey=sp.TAddress, tvalue=sp.TNat),
            baseState=baseContract.data,
        )

    def get_counter(self, address):
        counter = sp.local("counter", 0)
        sp.if self.data.user_store.contains(address):
            counter.value = self.data.user_store[address]
        return counter.value

    def increment_counter(self, address):
        sp.if ~self.data.user_store.contains(address):
            self.data.user_store[address] = 0
        self.data.user_store[address] += 1

    def assert_permit_exists(self, address, param_hash):
        rec = sp.record(address=address, param_hash=param_hash)
        sp.verify(
            self.data.permits.contains(rec),
            "Permit does not exist"
        )

    def store_permit(self, address, param_hash):
        rec = sp.record(address=address, param_hash=param_hash)
        self.data.permits[rec] = True

    def get_address_from_pub_key(self, pub_key):
        return sp.to_address(sp.implicit_account(sp.hash_key(pub_key)))
    
    def get_sender(self, pub_key):
        sp.if pub_key:
            return self.get_address_from_pub_key(key)
        return sp.sender

    def check_meta_tx_validity(self, key, signature, param_hash):
        address = self.get_address_from_pub_key(key)
        counter = self.get_counter(address)
        data = sp.pack(
            sp.record(
                chain_id=sp.chain_id,
                contract_addr=sp.self_address,
                counter=counter,
                param_hash=param_hash
            )
        )
        sp.verify(
            sp.check_signature(key, signature, data),
            "MISSIGNED"
        )
        self.store_permit(address, data)
        self.increment_counter(address)

    # Update the implementation of functions to add meta-tx support
    # Note: This fn. is invoked by smartpy only at compile time
    def buildExtraMessages(self):
        for (name, f) in self.baseContract.messages.items():
            def message(self, params):
                self.baseContract.data = self.data.baseState

                # Add sig and key, optional parameters
                sp.set_type(params.sig, sp.TOption(sp.TSignature))
                sig = params.sig.open_some()
                sp.set_type(params.key, sp.TOption(sp.TKey))
                key = params.key.open_some()

                # Check if sig, key is present;
                # If so, validate meta_tx
                sp.if params.key.is_some() | params.sig.is_some():
                    param_hash = sp.blake2b(sp.pack(params.params))
                    self.check_meta_tx_validity(key, sig, param_hash)

                # Original fn implementation
                f.addedMessage.f(self.baseContract, params.params)

            self.addMessage(sp.entry_point(message, name))
