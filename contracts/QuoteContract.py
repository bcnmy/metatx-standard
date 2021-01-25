import smartpy as sp


class Quote(sp.Contract):
    def __init__(self):
        self.init(
            quote="",
            owner=sp.address(
                "tz1iWsypYWg345T2oUrorMrdU9dG8MC8cnar"
            )
        )

    @sp.entry_point
    def set_quote(self, new_quote):
        self.data.quote = new_quote
        self.data.owner = sp.sender
