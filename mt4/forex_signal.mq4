// modified from https://www.forexeadvisor.com/expert_generator.aspx

#include <EA_common.mqh>


extern int MagicNumber = 20210712;

int init() {
  // // 初始化点值, 1pip对应的小数位, 比如磅美MyPoint=0.00001*10=0.0001
  // if (TheDigits == 3 || TheDigits == 5) MyPoint = Point * 10;
  // 测试状态下关闭外部服务控制
  if (IsTesting()) {
    PipeControl = false;
  }


  // for(int i=0,len=ArraySize(ConfigArray);i<len;i++) {
  //   ConfigArray[i] = new Config();
  // }
  // for(int i=0,len=ArraySize(StateArray);i<len;i++) {
  //   StateArray[i] = new State();
  // }

  //初始化 named pipes 用于 node server 通信
  if (PipeControl) {
    init_pipe("mt4_signal");
    pipe_request_config(true);
  }

  return (0);
}

int deinit() {
  close_pipe();
  return (0);
}




int start() {

  // 每1分钟同步下订单
  if (isNewInterval(0, 60)) {
    pipe_request_config();
  }


  return (0);
}


void pipe_request_config(bool init = false) {
    CJAVal js;
    js["command"] = "request_config";
    js["init"] = init;
    pipe_send(js);
    pipe_receive_config();
}


void pipe_receive_config() {
  CJAVal json = pipe_receive();

  int hasOrders= json.FindKey("orders") != NULL;

  if (json["command"] == "sync_orders" && hasOrders) {
    CJAVal orders = json["orders"];
    for(int i=0,len=orders.Size(); i<len; i++) {
      CJAVal order = orders[i];
      string symbol = order["symbol"].ToStr();
      string id = order["id"].ToStr();
      string type = order["orderType"].ToStr();
      double openPrice = order["openPrice"].ToDbl();
      double takeProfit = order["takeProfit"].ToDbl();
      double stopLoss = order["stopLoss"].ToDbl();
      int oldOrder=findOrder(id);
      if (oldOrder<0) {// 创建订单
        int result=OrderSend(symbol, type=="buy" ? OP_BUY: OP_SELL, 0.1, MarketInfo(symbol, MODE_ASK), 0, stopLoss, takeProfit, id, MagicNumber, 0, Red);
        if (result > 0) {
            Print("open order:" + symbol+" type:" + type+" open price:" + DoubleToStr(openPrice));
          } else {
            Print("Custom order failed " + DoubleToStr(GetLastError()) + "  " + DoubleToStr(result));
          }
      }
    }

    for (int i = 0, total = OrdersTotal(); i < total; i++) {
        OrderSelect(i, SELECT_BY_POS, MODE_TRADES);
        bool isActive = false;
        for(int i=0,len=orders.Size(); i<len; i++) {
          CJAVal order = orders[i];
          string symbol = order["symbol"].ToStr();
          string id = order["id"].ToStr();

          if (OrderComment() == id) {
              isActive =true;
          }
        }
        if (!isActive) {
          OrderClose(OrderTicket(),OrderLots(),MarketInfo(OrderSymbol(), OrderType() == OP_BUY ? MODE_BID : MODE_ASK),10,Red);
        }
    }
    Print("Sync orders from node server");
  }
}

int findOrder(string cmt) {
    for (int i = 0, total = OrdersTotal(); i < total; i++) {
        OrderSelect(i, SELECT_BY_POS, MODE_TRADES);
        if (OrderComment() == cmt) {
            return OrderTicket();
        }
    }
    return -1;
}
